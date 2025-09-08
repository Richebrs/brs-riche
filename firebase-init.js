<!-- Charger Firebase depuis CDN -->
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>

<script>
// ✅ Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDQ2UWK115OXfThwaGfetIUSPPz_Ry78BA",
  authDomain: "brs-riche.firebaseapp.com",
  projectId: "brs-riche",
  storageBucket: "brs-riche.appspot.com",
  messagingSenderId: "44338076148",
  appId: "1:44338076148:web:b0c32d6caa12221fe601a1",
  measurementId: "G-FQ5ZFB4FYM"
};

// ✅ Initialisation Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// ✅ Fonction utilitaire pour écouter les données utilisateur
function listenUserData(callback) {
  auth.onAuthStateChanged(user => {
    if (user) {
      db.collection("users").doc(user.uid).onSnapshot(doc => {
        if (doc.exists) callback(user, doc.data());
      });
    } else {
      window.location.href = "login.html"; // si déconnecté
    }
  });
}
</script>

  
