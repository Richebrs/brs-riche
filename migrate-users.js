
// migrate-users.js
// Script pour migrer les utilisateurs existants et créer les champs manquants

// Charger firebase-init.js avant ce script
// <script src="firebase-init.js"></script>

auth.onAuthStateChanged(async user => {
  if (!user) return;

  console.log("Migration commencée...");

  const usersSnap = await db.collection("users").get();

  usersSnap.forEach(async doc => {
    const data = doc.data();
    const userRef = db.collection("users").doc(doc.id);

    // Mettre à jour les soldes
    await userRef.update({
      balanceAvailable: data.balance || 0,
      balanceWithdrawn: data.balanceWithdrawn || 0,
      balanceTotal: data.balanceTotal || data.balance || 0
    });

    // Vérifier et créer la collection transactions
    const transactionsRef = userRef.collection("transactions");
    const transactionsSnap = await transactionsRef.get();
    if (transactionsSnap.empty) {
      await transactionsRef.add({
        type: "init",
        amount: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    // Vérifier et créer la collection referrals (3 niveaux)
    const referralsRef = userRef.collection("referrals");
    const referralsSnap = await referralsRef.get();
    if (referralsSnap.empty) {
      await referralsRef.add({ level: 1, referredUserId: null });
      await referralsRef.add({ level: 2, referredUserId: null });
      await referralsRef.add({ level: 3, referredUserId: null });
    }

    // Vérifier et créer hotels et residences
    const hotelsRef = userRef.collection("hotels");
    if ((await hotelsRef.get()).empty) {
      await hotelsRef.add({ name: "Exemple Hotel", rooms: 0, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    }

    const residencesRef = userRef.collection("residences");
    if ((await residencesRef.get()).empty) {
      await residencesRef.add({ name: "Exemple Residence", units: 0, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    }
  });

  console.log("Migration terminée !");
});
                    
