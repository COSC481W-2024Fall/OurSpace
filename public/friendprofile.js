// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCppKyFDiC6qSWoS25mP4f-7DUfJ05BWl8",
    authDomain: "ourspace-9703c.firebaseapp.com",
    projectId: "ourspace-9703c",
    storageBucket: "ourspace-9703c.appspot.com",
    messagingSenderId: "829335148222",
    appId: "1:829335148222:web:94ebc43b2d3ea171e1b0ef",
    measurementId: "G-T3YWVB2JGV"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth(); // Initialize auth

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    if (!userId) {
        alert("No user ID provided.");
        return;
    }

    // Fetch friend profile info
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
        const userData = userDoc.data();
        document.getElementById('username').innerText = userData.username || "Username not found";
        document.getElementById('bio').innerText = userData.bio || "No bio available";
    } else {
        alert("User not found.");
    }

    // Fetch friend posts
    const postsContainer = document.getElementById('friendPosts');
    const postsSnapshot = await db.collection('users').doc(userId).collection('posts').get();
    postsSnapshot.forEach(doc => {
        const postData = doc.data();
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `<h3>${postData.title || "Untitled"}</h3><p>${postData.content || ""}</p>`;
        postsContainer.appendChild(postElement);
    });
});

// Sign out function
function signOut() { 
    auth.signOut().then(() => {
        console.log("User signed out successfully.");
        window.location.href = 'login.html'; 
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
}
