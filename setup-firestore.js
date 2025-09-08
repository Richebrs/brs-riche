
<script>
function setupFirestore() {
  auth.onAuthStateChanged(async user => {
    if (!user) return;

    const userRef = db.collection("users").doc(user.uid);

    try {
      // Mettre à jour (ou créer) le document utilisateur avec merge
      await userRef.set({
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        username: user.email.split('@')[0],
        balanceAvailable: firebase.firestore.FieldValue.increment(0),
        balanceWithdrawn: firebase.firestore.FieldValue.increment(0),
        balanceTotal: firebase.firestore.FieldValue.increment(0),
        sponsor: null,
        role: "user",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true }); // ⚡ merge = ajoute les champs manquants sans écraser l’existant

      // Transactions
      const transactionsRef = userRef.collection("transactions");
      if ((await transactionsRef.get()).empty) {
        await transactionsRef.add({ type: "init", amount: 0, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      }

      // Referrals
      const referralsRef = userRef.collection("referrals");
      if ((await referralsRef.get()).empty) {
        await referralsRef.add({ level: 1, referredUserId: null });
        await referralsRef.add({ level: 2, referredUserId: null });
        await referralsRef.add({ level: 3, referredUserId: null });
      }

      // MyHotels
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

      console.log("✅ Setup Firestore terminé pour :", user.uid);
    } catch (err) {
      console.error("❌ Erreur setup Firestore :", err);
    }
  });
}
setupFirestore();
</script>
                          
