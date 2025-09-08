
<script>
// ✅ Création automatique des documents et sous-collections
auth.onAuthStateChanged(async user => {
  if (!user) return;

  const userRef = db.collection("users").doc(user.uid);
  const userDoc = await userRef.get();

  // === Document principal ===
  if (!userDoc.exists) {
    await userRef.set({
      email: user.email,
      username: user.displayName || user.email.split('@')[0],
      role: "user", // par défaut
      balanceAvailable: 0,
      balanceWithdrawn: 0,
      balanceTotal: 0,
      sponsor: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("📌 Nouveau document utilisateur créé :", user.email);
  }

  // === Transactions ===
  const transactionsRef = userRef.collection("transactions");
  if ((await transactionsRef.get()).empty) {
    await transactionsRef.add({
      type: "init",
      amount: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  // === Parrainages (3 niveaux) ===
  const referralsRef = userRef.collection("referrals");
  if ((await referralsRef.get()).empty) {
    await referralsRef.add({ level: 1, referredUserId: null });
    await referralsRef.add({ level: 2, referredUserId: null });
    await referralsRef.add({ level: 3, referredUserId: null });
  }

  // === Hôtels ===
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

  // === Résidences ===
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

  console.log("✅ Firestore setup terminé pour :", user.email);
});
</script>

      
