
<!-- setup-firestore.js -->
<script>
// Initialisation Firestore automatique pour chaque utilisateur connecté
function setupFirestore() {
  auth.onAuthStateChanged(async user => {
    if (!user) return;

    const userRef = db.collection("users").doc(user.uid);

    try {
      // Créer document utilisateur si inexistant
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        await userRef.set({
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          username: user.email.split('@')[0],
          balanceAvailable: 0,
          balanceWithdrawn: 0,
          balanceTotal: 0,
          sponsor: null,
          role: "user", // par défaut utilisateur, à changer pour admin si besoin
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      // Créer collection transactions
      const transactionsRef = userRef.collection("transactions");
      if ((await transactionsRef.get()).empty) {
        await transactionsRef.add({ type: "init", amount: 0, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      }

      // Créer parrainage 3 niveaux
      const referralsRef = userRef.collection("referrals");
      if ((await referralsRef.get()).empty) {
        await referralsRef.add({ level: 1, referredUserId: null });
        await referralsRef.add({ level: 2, referredUserId: null });
        await referralsRef.add({ level: 3, referredUserId: null });
      }

      // Créer hôtels achetés (myHotels)
      const myHotelsRef = userRef.collection("myHotels");
      if ((await myHotelsRef.get()).empty) {
        await myHotelsRef.add({
          hotelId: null,
          name: "Exemple Hôtel",
          price: 0,
          dailyRate: 0,
          acquiredAt: null,
          expiresAt: null,
          lastProfitAt: null,
          imageUrl: ""
        });
      }

      // Créer hôtels et résidences globales
      const hotelsRef = userRef.collection("hotels");
      if ((await hotelsRef.get()).empty) {
        await hotelsRef.add({ name: "Exemple Hotel", rooms: 0, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      }

      const residencesRef = userRef.collection("residences");
      if ((await residencesRef.get()).empty) {
        await residencesRef.add({ name: "Exemple Residence", units: 0, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      }

      console.log("✅ Setup Firestore terminé pour l'utilisateur :", user.uid);

    } catch (err) {
      console.error("❌ Erreur lors du setup Firestore :", err);
    }
  });
}

// Lancer la configuration automatique
setupFirestore();
</script>
                          
