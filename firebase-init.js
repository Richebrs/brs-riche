
// firebase-init.js
// Firebase config et connexion pour toutes les pages

// Charger Firebase depuis CDN avant ce script dans chaque page HTML
// <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>

const firebaseConfig = {
  apiKey: "AIzaSyDQ2UWK115OXfThwaGfetIUSPPz_Ry78BA",
  authDomain: "brs-riche.firebaseapp.com",
  projectId: "brs-riche",
  storageBucket: "brs-riche.appspot.com",
  messagingSenderId: "44338076148",
  appId: "1:44338076148:web:b0c32d6caa12221fe601a1",
  measurementId: "G-FQ5ZFB4FYM"
};

// Initialisation Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Fonction utilitaire pour écouter l'utilisateur en temps réel
function listenUserData(callback) {
  auth.onAuthStateChanged(user => {
    if (user) {
      db.collection("users").doc(user.uid).onSnapshot(doc => {
        if (doc.exists) callback(user, doc.data());
      });
    } else {
      window.location.href = "login.html";
    }
  });
}

💡 Toutes les pages HTML devront charger ce script avant les scripts spécifiques à la page.


---

2️⃣ Initialiser les collections et documents pour un utilisateur

Crée un fichier setup-firestore.js qui va créer automatiquement :

users → avec balanceAvailable, balanceWithdrawn, balanceTotal, sponsor, etc.

transactions → pour les historiques

referrals → 3 niveaux

hotels et residences → pour les propriétés


// setup-firestore.js
function setupFirestore() {
  auth.onAuthStateChanged(async user => {
    if (!user) return;

    const userRef = db.collection("users").doc(user.uid);

    // Créer document utilisateur si inexistant
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      await userRef.set({
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        balanceAvailable: 0,
        balanceWithdrawn: 0,
        balanceTotal: 0,
        sponsor: null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    // Créer collection transactions
    const transactionsRef = userRef.collection("transactions");
    const transactionsSnap = await transactionsRef.get();
    if (transactionsSnap.empty) {
      await transactionsRef.add({ type: "init", amount: 0, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    }

    // Créer parrainage 3 niveaux
    const referralsRef = userRef.collection("referrals");
    const referralsSnap = await referralsRef.get();
    if (referralsSnap.empty) {
      await referralsRef.add({ level: 1, referredUserId: null });
      await referralsRef.add({ level: 2, referredUserId: null });
      await referralsRef.add({ level: 3, referredUserId: null });
    }

    // Créer hotels et residences
    const hotelsRef = userRef.collection("hotels");
    if ((await hotelsRef.get()).empty) {
      await hotelsRef.add({ name: "Exemple Hotel", rooms: 0, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    }
    const residencesRef = userRef.collection("residences");
    if ((await residencesRef.get()).empty) {
      await residencesRef.add({ name: "Exemple Residence", units: 0, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    }

    console.log("Setup Firestore terminé !");
  });
}

setupFirestore();
  
