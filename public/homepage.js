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

// Show modal with the follower's details
function showFollowerActionModal(followerData) {
    const modal = document.getElementById('followerActionModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalAddFollowerBtn = document.getElementById('modalAddFollowerBtn');
    const modalViewProfileBtn = document.getElementById('modalViewProfileBtn');
    
    modalTitle.textContent = `Do you want to follow ${followerData.username}?`;
    modalMessage.textContent = `If you just want to view their profile, click 'View Profile'. Otherwise, click 'Follow'.`;
    
    modalAddFollowerBtn.onclick = function () {
        addFollower(followerData);
    };
    modalViewProfileBtn.onclick = function () {
        viewProfile(followerData);
    };

    modal.style.display = "block"; // Show the modal
}

// Close the modal
function closeModal() {
    const modal = document.getElementById('followerActionModal');
    modal.style.display = "none";
}

// Action to add a follower
async function addFollower(followerData) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        alert('You must be signed in to follow someone.');
        return;
    }

    const userRef = db.collection('users').doc(currentUser.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!userData.followers) {
        userData.followers = [];
    }

    if (userData.followers.includes(followerData.id)) {
        alert(`${followerData.username} is already in your followers list.`);
        return;
    }

    userData.followers.push(followerData.id);
    await userRef.update({ followers: userData.followers });

    alert(`${followerData.username} has been added to your followers list.`);
    closeModal();
    displayUpdatedFollowersList();
}

// Action to view the follower's profile
function viewProfile(followerData) {
    window.location.href = `friendsprofile.html?userId=${followerData.id}`;
    closeModal();
}

// Search for followers
async function searchFollowers() {
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
                const followerDiv = document.createElement('div');
                followerDiv.innerHTML = data.username;

                followerDiv.onclick = () => {
                    showFollowerActionModal({ username: data.username, id: doc.id });
                };

                resultsContainer.appendChild(followerDiv);
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

// Display followers list
async function displayUpdatedFollowersList() {
    const currentUser = auth.currentUser;

    if (currentUser) {
        const userRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData && userData.followers) {
                displayFollowers(userData.followers);
            } else {
                displayFollowers([]); // Pass an empty array to display "No followers yet"
            }
        } else {
            console.error("User document does not exist.");
            displayFollowers([]); // Handle case where user document doesn't exist
        }
    } else {
        console.error("No user is logged in.");
        displayFollowers([]); // Handle case where no user is logged in
    }
}

// Function to display followers in the UI with profile buttons
async function displayFollowers(followerIds) {
    const followersListContainer = document.querySelector('.followers-list ul');
    followersListContainer.innerHTML = '';

    if (!followerIds || followerIds.length === 0) {
        const noFollowersMessage = document.createElement('li');
        noFollowersMessage.textContent = "You have no followers yet.";
        noFollowersMessage.classList.add('no-followers-message');
        followersListContainer.appendChild(noFollowersMessage);
        return;
    }

    for (const followerId of followerIds) {
        const followerRef = db.collection('users').doc(followerId);
        const followerDoc = await followerRef.get();

        if (followerDoc.exists) {
            const followerData = followerDoc.data();

            const followerLi = document.createElement('li');
            followerLi.classList.add('follower-item');

            const followerName = document.createElement('span');
            followerName.textContent = followerData.username;
            followerName.classList.add('follower-name');

            const profileButton = document.createElement('button');
            profileButton.textContent = 'View Profile';
            profileButton.classList.add('profile-button');
            profileButton.onclick = () => {
                window.location.href = `friendsprofile.html?userId=${followerId}`;
            };

            followerLi.appendChild(followerName);
            followerLi.appendChild(profileButton);
            followersListContainer.appendChild(followerLi);
        }
    }
}

// Automatically display followers list and posts on page load
document.addEventListener('DOMContentLoaded', async () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            displayUpdatedFollowersList();
        }
    });
});

// Function to display posts from followers with like button functionality
async function displayFollowersPosts() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        console.error("User is not logged in.");
        alert("Please log in to view your followers' posts.");
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
            const followerIds = userData.followers || []; // Retrieve followers array or initialize to empty

            if (followerIds.length === 0) {
                postsContainer.innerHTML = `<p>You have no followers' posts to display.</p>`;
                return;
            }

            // Fetch posts for each follower
            for (const followerId of followerIds) {
                const followerRef = db.collection('users').doc(followerId);
                const followerDoc = await followerRef.get();

                if (followerDoc.exists) {
                    const followerData = followerDoc.data();
                    const followerUsername = followerData.username || "Unknown User";

                    // Fetch the follower's posts
                    const postsSnapshot = await followerRef.collection('posts').orderBy('createdAt', 'desc').get();

                    if (!postsSnapshot.empty) {
                        postsSnapshot.forEach((postDoc) => {
                            const post = postDoc.data();
                            const postId = postDoc.id;

                            // Check if the post has the required fields
                            if (post.content && post.createdAt) {
                                const postElement = document.createElement('div');
                                postElement.classList.add('post');
                                postElement.innerHTML = `
                                    <h4>${followerUsername}</h4>
                                    <p>${post.content}</p>
                                    <small>${new Date(post.createdAt.seconds * 1000).toLocaleString()}</small>
                                    <button class="like-btn" data-post-id="${postId}" data-follower-id="${followerId}">Like</button>
                                    <span class="likes-count">${post.likesCount || 0} likes</span>
                                `;
                                postsContainer.appendChild(postElement);

                                // Attach like button handler
                                attachLikeHandlerToButton(
                                    postElement.querySelector('.like-btn'),
                                    followerId,
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
        console.error("Error fetching followers' posts:", error);
    }
}

// Function to attach a like handler to a specific button
function attachLikeHandlerToButton(button, followerId, postId) {
    button.addEventListener('click', async () => {
        const postRef = db.collection('users').doc(followerId).collection('posts').doc(postId);
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


// Call `displayFollowersPosts` on page load
document.addEventListener('DOMContentLoaded', async () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            displayFollowersPosts(); // Fetch and display followers' posts on page load
        }
    });
});


// Call displayUpdatedFriendsList when page is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Set the click event for the "Show Friends List" toggle
    const friendsTitle = document.querySelector('.friends-list-title');
    friendsTitle.addEventListener('click', showFriendsList);
});
