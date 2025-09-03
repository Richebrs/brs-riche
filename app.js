const db = firebase.firestore();
const auth = firebase.auth();

const { createApp } = Vue;
createApp({
  data() {
    return {
      user: null,
      form: { signup: { email: "", password: "", referrer: "" }, login: { email: "", password: "" } },
      amount: 100, balance: 0, lastAppliedAt: null,
      transactions: [], message: "", error: "",
      DAILY_RATE: 0.02,
      REFERRAL_LEVELS: [0.15, 0.05, 0.05] // parrainage 3 niveaux
    };
  },
  computed: {
    lastAppliedAtText() {
      if (!this.lastAppliedAt) return "—";
      const d = this.lastAppliedAt?.toDate?.() || new Date(this.lastAppliedAt);
      return d.toLocaleString();
    }
  },
  methods: {
    format(n) { return new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD'}).format(Number(n||0)); },

    async register() {
      this.error = this.message = "";
      try {
        const { user } = await auth.createUserWithEmailAndPassword(
          this.form.signup.email.trim(),
          this.form.signup.password
        );

        await db.collection('users').doc(user.uid).set({
          email: user.email,
          created_at: firebase.firestore.FieldValue.serverTimestamp(),
          referrer: this.form.signup.referrer || null,
          level1:0, level2:0, level3:0
        });

        await db.collection('wallets').doc(user.uid).set({
          balance:0,
          lastAppliedAt:firebase.firestore.FieldValue.serverTimestamp()
        });

        this.message = "Inscription réussie ✅";
      } catch(e) { this.error = e.message; }
    },

    async login() {
      this.error = this.message = "";
      try {
        await auth.signInWithEmailAndPassword(
          this.form.login.email.trim(),
          this.form.login.password
        );
        this.message = "Connexion réussie ✅";
      } catch(e){ this.error = e.message; }
    },

    async logout() {
      await auth.signOut();
      this.user = null;
      this.balance = 0;
      this.transactions = [];
      this.lastAppliedAt = null;
      this.message = "Déconnecté.";
    },

    async loadData() {
      if (!this.user) return;
      const wdoc = await db.collection('wallets').doc(this.user.uid).get();
      if (wdoc.exists) {
        const w = wdoc.data();
        this.balance = Number(w.balance||0);
        this.lastAppliedAt = w.lastAppliedAt||null;
      }

      const q = await db.collection('transactions').doc(this.user.uid)
        .collection('items').orderBy('created_at','desc').limit(50).get();
      this.transactions = q.docs.map(d=>({id:d.id,...d.data()}));
    },

    async deposit() {
      this.error=this.message="";
      if(!this.user) return;
      const amt = Number(this.amount||0);
      if(amt<=0){this.error="Montant invalide."; return;}

      const refWallet = db.collection('wallets').doc(this.user.uid);
      const refTx = db.collection('transactions').doc(this.user.uid).collection('items').doc();

      await db.runTransaction(async t=>{
        const snap = await t.get(refWallet);
        let bal = snap.exists?Number(snap.data().balance||0):0;
        bal += amt;
        t.set(refWallet,{balance:bal,lastAppliedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
        t.set(refTx,{type:'deposit',amount:amt,created_at:firebase.firestore.FieldValue.serverTimestamp()});

        // Parrainage 3 niveaux
        let currentReferrer = (await db.collection('users').doc(this.user.uid).get()).data().referrer;
        for(let i=0;i<3 && currentReferrer;i++){
          const parentWalletRef = db.collection('wallets').doc(currentReferrer);
          const parentTxRef = db.collection('transactions').doc(currentReferrer).collection('items').doc();
          const parentSnap = await t.get(parentWalletRef);
          let parentBal = parentSnap.exists?Number(parentSnap.data().balance||0):0;
          const commission = amt*this.REFERRAL_LEVELS[i];
          parentBal += commission;
          t.set(parentWalletRef,{balance:parentBal},{merge:true});
          t.set(parentTxRef,{type:'referral_bonus',amount:commission,level:i+1,created_at:firebase.firestore.FieldValue.serverTimestamp()});

          const userData = await db.collection('users').doc(currentReferrer).get();
          currentReferrer = userData.data().referrer;
        }
      });

      this.message="Dépôt ajouté et commissions appliquées.";
      await this.loadData();
    },

    async applyGains() {
      this.error=this.message="";
      if(!this.user) return;
      const refWallet = db.collection('wallets').doc(this.user.uid);
      const refTx = db.collection('transactions').doc(this.user.uid).collection('items').doc();

      await db.runTransaction(async t=>{
        const snap = await t.get(refWallet);
        if(!snap.exists) throw new Error("Portefeuille inexistant");
        const data = snap.data();
        let bal = Number(data.balance||0);
        const last = (data.lastAppliedAt?.toDate?.()||new Date(data.lastAppliedAt||Date.now()));
        const now = new Date();
        const days = Math.max(1,Math.floor((now-last)/(1000*60*60*24)));
        const gain = bal*this.DAILY_RATE*days;
        bal += gain;
        t.update(refWallet,{balance:bal,lastAppliedAt:firebase.firestore.FieldValue.serverTimestamp()});
        t.set(refTx,{type:'profit',amount:Number(gain.toFixed(2)),created_at:firebase.firestore.FieldValue.serverTimestamp()});
      });

      this.message="Gains appliqués.";
      await this.loadData();
    }
  },

  mounted() {
    auth.onAuthStateChanged(async u=>{
      this.user=u;
      this.message=this.error="";
      if(u) await this.loadData();
    });
  }
}).mount('#app');

      
