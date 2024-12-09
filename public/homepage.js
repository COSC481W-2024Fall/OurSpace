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

// Show modal with the friend's details
function showFriendActionModal(friendData) {
    const modal = document.getElementById('friendActionModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalAddFriendBtn = document.getElementById('modalAddFriendBtn');
    const modalViewProfileBtn = document.getElementById('modalViewProfileBtn');
    
    modalTitle.textContent = `Do you want to add ${friendData.username} as a friend?`;
    modalMessage.textContent = `If you just want to view their profile, click 'View Profile'. Otherwise, click 'Add Friend'.`;
    
    // Set the actions for the buttons
    modalAddFriendBtn.onclick = function () {
        addFriend(friendData);
    };
    modalViewProfileBtn.onclick = function () {
        viewProfile(friendData);
    };

    modal.style.display = "block"; // Show the modal
}

// Close the modal
function closeModal() {
    const modal = document.getElementById('friendActionModal');
    modal.style.display = "none";
}

// Action to add a friend
async function addFriend(friendData) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        alert('You must be signed in to add friends.');
        return;
    }

    const userRef = db.collection('users').doc(currentUser.uid);  // Use UID for the document ID
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    // Check if the 'friends' field exists, if not, initialize it as an empty array
    if (!userData.friends) {
        userData.friends = [];  // Initialize friends as an empty array if not present
    }

    // Check if the user already has this friend in their list
    if (userData.friends.includes(friendData.id)) {
        alert(`${friendData.username} is already in your friends list.`);
        return;
    }

    // If the user doesn't already have the friend, add the friend to the list
    userData.friends.push(friendData.id);

    // Update the user's friends list in Firestore
    await userRef.update({ friends: userData.friends });

    alert(`${friendData.username} has been added to your friends list.`);

    // Close the modal and refresh the list of friends
    closeModal();
    displayUpdatedFriendsList();  // Refresh the friends list after adding
}

// Action to view the friend's profile
function viewProfile(friendData) {
    // Redirect to friend's profile page
    window.location.href = `friendsprofile.html?userId=${friendData.id}`;
    closeModal(); // Close the modal after redirection
}


// Action to view the friend's profile
function viewProfile(friendData) {
    // Redirect to friend's profile page
    window.location.href = `friendsprofile.html?userId=${friendData.id}`;
    closeModal(); // Close the modal after redirection
}

// Modify the searchFriends function to use the new modal
async function searchFriends() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = 'none';

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
                    showFriendActionModal({ username: data.username, id: doc.id });
                };

                resultsContainer.appendChild(friendDiv);
            }
        });

        if (!found) {
            const noUsersDiv = document.createElement('div');
            noUsersDiv.innerHTML = 'No users found';
            resultsContainer.appendChild(noUsersDiv);
        }

        resultsContainer.style.display = 'block';
    } else {
        resultsContainer.style.display = 'none';
    }
}

// Display friends list
async function displayUpdatedFriendsList() {
    const currentUser = auth.currentUser;

    if (currentUser) {
        const userRef = db.collection('users').doc(currentUser.uid); // Use UID for the document ID
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            console.log("User Data:", userData);  // Check user data

            if (userData && userData.friends) {
                console.log("Friends List:", userData.friends);  // Log friends list
                displayFriends(userData.friends);
            } else {
                alert("No friends field in user data.");
            }
        } else {
            console.log("User document does not exist for:", currentUser.uid);  // Log if the document doesn't exist
            alert("User document does not exist. Please try again.");
        }
    } else {
        console.log("No user is logged in.");
        alert("Please log in first.");
    }
}

// Function to display friends list in the UI
async function displayFriends(friendIds) {
    const friendsListContainer = document.querySelector('.friends-list ul');
    friendsListContainer.innerHTML = ''; // Clear previous friends list

    // If the friends array is empty, show a message
    if (friendIds && friendIds.length === 0) {
        const noFriendsMessage = document.createElement('li');
        noFriendsMessage.textContent = "You have no friends yet.";
        friendsListContainer.appendChild(noFriendsMessage);
    } else if (friendIds) {
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

async function displayFriendsPosts() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        console.error("User is not logged in.");
        alert("Please log in to view your friends' posts.");
        return;
    }

    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) {
        console.error("Posts container not found.");
        return;
    }

    postsContainer.innerHTML = ''; // Clear previous posts

    try {
        // Fetch the current user's document
        const userRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            const friendIds = userData.friends || []; // Retrieve friends array or initialize to empty

            if (friendIds.length === 0) {
                postsContainer.innerHTML = `<p>You have no friends' posts to display.</p>`;
                return;
            }

            // Fetch posts for each friend
            for (const friendId of friendIds) {
                const friendRef = db.collection('users').doc(friendId);
                const friendDoc = await friendRef.get();

                if (friendDoc.exists) {
                    const friendData = friendDoc.data();
                    const friendUsername = friendData.username || "Unknown User";

                    // Fetch the friend's posts
                    const postsSnapshot = await friendRef.collection('posts').orderBy('createdAt', 'desc').get();

                    if (!postsSnapshot.empty) {
                        postsSnapshot.forEach((postDoc) => {
                            const post = postDoc.data();
                            const postId = postDoc.id;

                            // Check if the post has the required fields
                            if (post.content && post.createdAt) {
                                const postElement = document.createElement('div');
                                postElement.classList.add('post');
                                postElement.innerHTML = `
                                    <h4>${friendUsername}</h4>
                                    <p>${post.content}</p>
                                    <small>${new Date(post.createdAt.seconds * 1000).toLocaleString()}</small>
                                    <button class="like-btn" data-post-id="${postId}" data-friend-id="${friendId}">Like</button>
                                    <span class="likes-count">${post.likesCount || 0} likes</span>
                                `;
                                postsContainer.appendChild(postElement);

                                // Attach like button handler
                                attachLikeHandlerToButton(
                                    postElement.querySelector('.like-btn'),
                                    friendId,
                                    postId
                                );
                            } else {
                                console.warn("Post is missing content or createdAt fields:", post);
                            }
                        });
                    }
                }
            }
        } else {
            console.error("User document not found for logged-in user.");
        }
    } catch (error) {
        console.error("Error fetching friends' posts:", error);
    }
}

// Function to attach a like handler to a specific button
function attachLikeHandlerToButton(button, friendId, postId) {
    button.addEventListener('click', async () => {
        const postRef = db.collection('users').doc(friendId).collection('posts').doc(postId);
        const likesCountSpan = button.nextElementSibling; // Span showing likes count

        try {
            const postDoc = await postRef.get();
            if (postDoc.exists) {
                const postData = postDoc.data();
                const likedBy = postData.likedBy || [];
                let newLikesCount = postData.likesCount || 0; // Ensure likesCount is a number

                if (likedBy.includes(auth.currentUser.uid)) {
                    // User has already liked the post, so unlike it
                    newLikesCount -= 1;
                    await postRef.update({
                        likesCount: newLikesCount,
                        likedBy: firebase.firestore.FieldValue.arrayRemove(auth.currentUser.uid)
                    });
                } else {
                    // User has not liked the post, so like it
                    newLikesCount += 1;
                    await postRef.update({
                        likesCount: newLikesCount,
                        likedBy: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid)
                    });
                }

                // Update UI immediately
                likesCountSpan.textContent = `${newLikesCount} likes`;
            } else {
                console.error("Post document not found:", postId);
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    });
}


// Call `displayFriendsPosts` on page load
document.addEventListener('DOMContentLoaded', async () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            displayFriendsPosts(); // Fetch and display friends' posts on page load
        }
    });
});


// Call displayUpdatedFriendsList when page is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Set the click event for the "Show Friends List" toggle
    const friendsTitle = document.querySelector('.friends-list-title');
    friendsTitle.addEventListener('click', showFriendsList);
});
