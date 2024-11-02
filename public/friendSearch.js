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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Function to check user authentication state
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('User is signed in:', user.uid);
        // You can set user info to display or enable certain features
    } else {
        console.log('No user is signed in.');
        // Redirect to login or show public content
        window.location.href = 'login.html'; // Redirect to login if not signed in
    }
});

// Existing function to search friends
async function searchFriends(query) {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '>=', query).get();
    
    const results = [];
    snapshot.forEach(doc => {
        results.push(doc.data());
    });

    // Update your UI with the results
}

// Add event listener for search input
document.getElementById('friendSearchInput').addEventListener('input', function() {
    const query = this.value;
    if (query) {
        searchFriends(query);
    }
});