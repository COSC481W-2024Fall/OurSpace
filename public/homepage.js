// Firebase configuration
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

const auth = firebase.auth();
const db = firebase.firestore();

function signOut() {
    auth.signOut().then(() => {
        console.log("User signed out successfully.");
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
}

async function searchFriends() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';  // Clear previous results
    resultsContainer.style.display = 'none'; // Hide dropdown initially

    if (query) {
        const snapshot = await db.collection('users').get();
        let found = false;

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.username && data.username.toLowerCase().includes(query)) {
                found = true;
                const friendDiv = document.createElement('div');
                friendDiv.innerHTML = data.username;
                friendDiv.onclick = () => {
                    window.location.href = `friendsprofile.html?userId=${doc.id}`;
                };
                resultsContainer.appendChild(friendDiv);
            }
        });

        // If no users are found
        if (!found) {
            const noUsersDiv = document.createElement('div');
            noUsersDiv.innerHTML = 'No users found';
            resultsContainer.appendChild(noUsersDiv);
        }

        // Show dropdown if there are results
        resultsContainer.style.display = 'block'; // Show dropdown
    } else {
        resultsContainer.style.display = 'none'; // Hide if input is empty
    }
}
