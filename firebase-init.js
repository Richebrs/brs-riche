// Fichier : firebase-init.js
// Configuration Firebase pour ton projet BRS Riche

const firebaseConfig = {
  apiKey: "AIzaSyDQ2UWK115OXfThwaGfetIUSPPz_Ry78BA",
  authDomain: "brs-riche.firebaseapp.com",
  projectId: "brs-riche",
  storageBucket: "brs-riche.firebasestorage.app",
  messagingSenderId: "44338076148",
  appId: "1:44338076148:web:b0c32d6caa12221fe601a1",
  measurementId: "G-FQ5ZFB4FYM"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
