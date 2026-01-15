let firebaseConfig = {
    apiKey: "AIzaSyB9mwjqDNeKsnjBMt8C27EuC3DTX_luzSQ",
    authDomain: "blogging-website-1fc45.firebaseapp.com",
    projectId: "blogging-website-1fc45",
    storageBucket: "blogging-website-1fc45.firebasestorage.app",
    messagingSenderId: "931388746526",
    appId: "1:931388746526:web:964c299b16476750df370f"
  };

firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();
let auth = firebase.auth();

const logoutUser = () => {
  auth.signOut();
  location.reload();
}