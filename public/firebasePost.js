document.addEventListener('DOMContentLoaded', function () {
    const firebaseConfig = {
        apiKey: "AIzaSyCppKyFDiC6qSWoS25mP4f-7DUfJ05BWl8",
        authDomain: "ourspace-9703c.firebaseapp.com",
        projectId: "ourspace-9703c",
        storageBucket: "ourspace-9703c.appspot.com",
        messagingSenderId: "829335148222",
        appId: "1:829335148222:web:94ebc43b2d3ea171e1b0ef",
        measurementId: "G-T3YWVB2JGV"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();
    const db = firebase.firestore();

    document.getElementById('postForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const postContent = document.getElementById('postContent').value;

        auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userId = user.uid;

                if (postContent) {
                    try {
                        const userRef = db.collection('users').doc(userId);
                        const userDoc = await userRef.get();

                        if (!userDoc.exists) {
                            throw new Error("User data not found.");
                        }

                        const name = userDoc.data().name || "Unknown User"; // Fetch the name (not username)

                        // Add post to Firestore
                        const postRef = await userRef.collection('posts').add({
                            content: postContent,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            likesCount: 0,
                            likedBy: []
                        });

                        document.getElementById('postContent').value = ''; // Clear the form

                        // Update DOM immediately
                        const newPost = {
                            id: postRef.id,
                            content: postContent,
                            username: name, // Use name instead of username
                            likesCount: 0,
                            createdAt: new Date()
                        };
                        addPostToDOM(newPost);
                    } catch (error) {
                        console.error("Error creating post:", error);
                        alert("Error: " + error.message);
                    }
                } else {
                    alert("Please enter content to post.");
                }
            } else {
                alert("User is not logged in.");
            }
        });
    });

    loadPosts(); // Load existing posts on page load

    // Function to add a post to the DOM
    function addPostToDOM(post) {
        const postsContainer = document.getElementById('postsContainer');
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // Create the post display
        postElement.innerHTML = `
            <h4>${post.username}</h4> <!-- Display the user's name -->
            <p>${post.content}</p>
            <small>${post.createdAt.toLocaleString()}</small>
            <button class="like-btn" data-post-id="${post.id}">Like</button>
            <span class="likes-count">${post.likesCount} likes</span>
        `;
        postsContainer.prepend(postElement); // Add the new post to the top of the container

        // Attach like handler to the newly added post
        const likeButton = postElement.querySelector('.like-btn');
        attachLikeHandlerToButton(likeButton, auth.currentUser.uid, post.id);
    }

    // Load posts for the currently logged-in user
    async function loadPosts() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userId = user.uid;

                try {
                    const userRef = db.collection('users').doc(userId);
                    const userDoc = await userRef.get();

                    if (!userDoc.exists) {
                        throw new Error("User document not found.");
                    }

                    const name = userDoc.data().name || "Unknown User"; // Fetch the name instead of username

                    const userPosts = await userRef.collection('posts')
                        .orderBy("createdAt", "desc")
                        .get();

                    const postsContainer = document.getElementById('postsContainer');
                    postsContainer.innerHTML = ''; // Clear current posts

                    userPosts.forEach(doc => {
                        addPostToDOM({
                            id: doc.id,
                            content: doc.data().content,
                            username: name, // Use name instead of username
                            likesCount: doc.data().likesCount || 0,
                            createdAt: doc.data().createdAt.toDate()
                        });
                    });
                } catch (error) {
                    console.error("Error loading posts:", error);
                }
            } else {
                console.log("User is not logged in.");
            }
        });
    }
});
