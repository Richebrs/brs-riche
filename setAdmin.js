!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Définir Admin</title>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>
  <script src="firebase-init.js"></script>
</head>
<body>
  <h2>Définir Admin</h2>
  <button onclick="setAdmin()">Donner rôle admin</button>
  <p id="status"></p>

  <script>
    async function setAdmin() {
      try {
        const user = auth.currentUser;
        if (!user) {
          document.getElementById("status").innerText = "⚠️ Connecte-toi d'abord.";
          return;
        }

        await db.collection("users").doc(user.uid).update({
          role: "admin"
        });

        document.getElementById("status").innerText = "✅ Ton rôle est défini comme ADMIN !";
      } catch (e) {
        console.error(e);
        document.getElementById("status").innerText = "❌ Erreur : " + e.message;
      }
    }
  </script>
</body>
</html>
