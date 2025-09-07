
async function generateProfits(userId) {
  const userRef = db.collection("users").doc(userId);
  const myHotelsRef = userRef.collection("myHotels");

  const snapshot = await myHotelsRef.get();
  const today = new Date().toDateString();

  snapshot.forEach(async doc => {
    const data = doc.data();
    const lastProfitDate = data.lastProfitAt ? new Date(data.lastProfitAt.toDate()).toDateString() : null;

    // Vérifie expiration
    if (data.expiresAt && new Date() > data.expiresAt.toDate()) return;

    if (lastProfitDate !== today) {
      const profit = data.price * data.dailyRate;

      await userRef.update({
        balanceAvailable: firebase.firestore.FieldValue.increment(profit),
        balanceTotal: firebase.firestore.FieldValue.increment(profit)
      });

      await userRef.collection("transactions").add({
        type: "profit",
        amount: profit,
        hotelName: data.name,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      await doc.ref.update({
        lastProfitAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  });
}

// À appeler dans le dashboard
auth.onAuthStateChanged(user => {
  if (user) generateProfits(user.uid);
});

