script>
  async function updateUserRoles() {
    try {
      const usersRef = db.collection("users");
      const snapshot = await usersRef.get();

      snapshot.forEach(async doc => {
        const data = doc.data();
        if (!data.role) {
          await usersRef.doc(doc.id).update({
            role: "user" // 👈 tous les anciens utilisateurs auront "user"
          });
          console.log("✅ Role ajouté pour :", doc.id);
        } else {
          console.log("ℹ️ Role déjà présent pour :", doc.id);
        }
      });

      alert("✅ Vérification terminée : les rôles sont bien ajoutés.");
    } catch (err) {
      console.error("❌ Erreur mise à jour roles :", err);
    }
  }

  // Lancer la mise à jour dès que la page charge
  updateUserRoles();
</script>
