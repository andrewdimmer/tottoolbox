// Initialize Firebase
function initializeFirebase() {
    var config = {
        apiKey: "AIzaSyA_ByBZzj5yP2leW2QjP1GSu0jukkO-2F0",
        authDomain: "khe2018-gcp.firebaseapp.com",
        databaseURL: "https://khe2018-gcp.firebaseio.com",
        projectId: "khe2018-gcp",
        storageBucket: "khe2018-gcp.appspot.com",
        messagingSenderId: "94310402577"
    };
    firebase.initializeApp(config);
}

// Ensures that firebase is initialized on all pages
initializeFirebase();