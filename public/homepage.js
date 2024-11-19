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

// Sign out function
function signOut() {
    auth.signOut().then(() => {
        console.log("User signed out successfully.");
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
}

// Search friends function
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

                // Handle click on a friend result
                friendDiv.onclick = () => {
                    if (confirm(`Do you want to add ${data.username} as a friend?`)) {
                        addFriend(data.username, doc.id);  // Add friend if confirmed
                    } else {
                        window.location.href = `friendsprofile.html?userId=${doc.id}`; // Go to profile if not
                    }
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

// Add friend function
async function addFriend(friendUsername, friendId) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        alert('You must be signed in to add friends.');
        return;
    }

    const userRef = db.collection('users').doc(currentUser.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    // Check if the user already has this friend in their list
    if (userData.friends && userData.friends.includes(friendId)) {
        alert(`${friendUsername} is already in your friends list.`);
        return;
    }

    // If the user doesn't already have the friend, add the friend to the list
    const updatedFriendsList = userData.friends ? [...userData.friends, friendId] : [friendId];
    await userRef.update({ friends: updatedFriendsList });

    alert(`${friendUsername} has been added to your friends list.`);

    // Refresh the friends list after adding
    displayUpdatedFriendsList();
}

// Function to display friends list
async function displayFriends(friendIds) {
    const friendsListContainer = document.querySelector('.friends-list ul');
    friendsListContainer.innerHTML = ''; // Clear previous friends list

    if (friendIds.length === 0) {
        const noFriendsMessage = document.createElement('li');
        noFriendsMessage.textContent = "You have no friends yet.";
        friendsListContainer.appendChild(noFriendsMessage);
    } else {
        // Fetch friend data from Firebase for each friendId
        for (const friendId of friendIds) {
            const friendRef = db.collection('users').doc(friendId);
            const friendDoc = await friendRef.get();

            if (friendDoc.exists) {
                const friendData = friendDoc.data();
                const friendLi = document.createElement('li');
                
                // Create an anchor tag with the friend's username and link to their profile
                const friendLink = document.createElement('a');
                friendLink.href = `friendsprofile.html?userId=${friendId}`;
                friendLink.textContent = friendData.username;

                friendLi.appendChild(friendLink); // Append the link inside the list item
                friendsListContainer.appendChild(friendLi);
            }
        }
    }
}

// Function to fetch and display the user's friend list when the homepage loads
async function displayUpdatedFriendsList() {
    const currentUser = auth.currentUser;

    if (currentUser) {
        const userRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        if (userData && userData.friends) {
            displayFriends(userData.friends);  // Call the function to display updated friends list
        } else {
            // If no friends list exists, show a message
            const friendsListContainer = document.querySelector('.friends-list ul');
            const noFriendsMessage = document.createElement('li');
            noFriendsMessage.textContent = "You have no friends yet.";
            friendsListContainer.appendChild(noFriendsMessage);
        }
    }
}

// Display friends list when the "Show Friends List" title is clicked
function showFriendsList() {
    const friendsListContainer = document.querySelector('.friends-list');
    const friendsTitle = document.querySelector('.friends-list-title');

    // If friends list is not loaded yet, load it
    if (!friendsListContainer.classList.contains('loaded')) {
        displayUpdatedFriendsList(); // Load the friends list
        friendsListContainer.classList.add('loaded'); // Mark it as loaded
        friendsTitle.textContent = 'Friends List';  // Change the title text after loading
    }
}

// Call displayUpdatedFriendsList when page is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Set the click event for the "Show Friends List" toggle
    const friendsTitle = document.querySelector('.friends-list-title');
    friendsTitle.addEventListener('click', showFriendsList);
});
