import './firebaseConfig';

const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged((user) => {
    if (user) {
        const username = user.email.split('@')[0]; 
        console.log(`Fetching data for user: ${username}`);
        loadUserData(username);
    } else {
        console.log("No user is signed in.");
        window.location.href = 'login.html';
    }
});

function loadUserData(username) {
    const userRef = db.collection("users").doc(username);
    userRef.get().then((doc) => {
        if (doc.exists) {
            const userData = doc.data();
            document.getElementById('username').innerText = userData.username || "Username not found"; 
            document.getElementById('bioDisplay').innerText = userData.bio || "No bio available"; 
        } else {
            console.log("No such document for username:", username);
            document.getElementById('bioDisplay').innerText = "No bio available";
        }
    }).catch((error) => {
        console.error("Error getting document:", error);
    });
}