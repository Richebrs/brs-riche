<!-- setup-firestore.js -->
<script>
function setupFirestore() {
  auth.onAuthStateChanged(async user => {
    if (!user) return;

    const userRef = db.collection("users").doc(user.uid);

    try {
      // ✅ Vérifier si le document existe
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        await userRef.set({
          email: user.email,
          username: user.displayName || user.email.split("@")[0],
          role: "user", // par défaut, tu peux mettre "admin" si besoin
          balanceAvailable: 0,
          balanceWithdrawn: 0,
          balanceTotal: 0,
          sponsor: null,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("📌 Nouveau document utilisateur créé !");
      } else {
        // ✅ Ajouter champs manquants
        await userRef.set({
          role: userDoc.data().role || "user",
          balanceAvailable: userDoc.data().balanceAvailable || 0,
          balanceWithdrawn: userDoc.data().balanceWithdrawn || 0,
          balanceTotal: userDoc.data().balanceTotal || 0,
          sponsor: userDoc.data().sponsor || null,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("🔄 Document utilisateur mis à jour :", user.email);
      }

      // ✅ Vérifier sous-collections
      const transactionsRef = userRef.collection("transactions");
      if ((await transactionsRef.get()).empty) {
        await transactionsRef.add({
          type: "init",
          amount: 0,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      const referralsRef = userRef.collection("referrals");
      if ((await referralsRef.get()).empty) {
        await referralsRef.add({ level: 1, referredUserId: null });
        await referralsRef.add({ level: 2, referredUserId: null });
        await referralsRef.add({ level: 3, referredUserId: null });
      }

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

      const myResidencesRef = userRef.collection("myResidences");
      if ((await myResidencesRef.get()).empty) {
        await myResidencesRef.add({
          residenceId: null,
          name: "Exemple Résidence",
          units: 0,
          acquiredAt: null,
          expiresAt: null,
          lastProfitAt: null,
          imageUrl: ""
        });
      }

      console.log("✅ Setup Firestore terminé pour :", user.email);

    } catch (err) {
      console.error("❌ Erreur setup Firestore :", err);
    }
  });
}

// ⚡ Lancer automatiquement
setupFirestore();
</script>
          
