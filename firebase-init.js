// Fichier : firebase-init.js
// Configuration Firebase pour ton projet BRS Riche

// Importé depuis les scripts Firebase dans index.html
// Assure-toi que ces scripts sont chargés avant app.js
// <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>

const firebaseConfig = {
  apiKey: "AIzaSyDQ2UWK115OXfThwaGfetIUSPPz_Ry78BA",
  authDomain: "brs-riche.firebaseapp.com",
  projectId: "brs-riche",
  storageBucket: "brs-riche.firebasestorage.app",
  messagingSenderId: "44338076148",
  appId: "1:44338076148:web:b0c32d6caa12221fe601a1",
  measurementId: "G-FQ5ZFB4FYM"
};

// Initialisation Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Exporter db et auth pour usage dans app.js
const db = firebase.firestore();
const auth = firebase.auth();
