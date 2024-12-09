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

                        const username = userDoc.data().username || "Unknown User";

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
                            username: username,
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

    // Function to attach a like handler to a specific button
    function attachLikeHandlerToButton(button, userId, postId) {
        button.addEventListener('click', async () => {
            const postRef = db.collection('users').doc(userId).collection('posts').doc(postId);
            const likesCountSpan = button.nextElementSibling; // Span showing likes count
    
            try {
                const postDoc = await postRef.get();
                if (postDoc.exists) {
                    const postData = postDoc.data();
                    const likedBy = postData.likedBy || [];
                    let newLikesCount = postData.likesCount || 0; // Ensure likesCount is a number
    
                    if (likedBy.includes(userId)) {
                        // User has already liked the post, so unlike it
                        newLikesCount -= 1;
                        await postRef.update({
                            likesCount: newLikesCount,
                            likedBy: firebase.firestore.FieldValue.arrayRemove(userId)
                        });
                    } else {
                        // User has not liked the post, so like it
                        newLikesCount += 1;
                        await postRef.update({
                            likesCount: newLikesCount,
                            likedBy: firebase.firestore.FieldValue.arrayUnion(userId)
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
    
    // Function to add a post to the DOM
    function addPostToDOM(post) {
        const postsContainer = document.getElementById('postsContainer');
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // Create the post display
        postElement.innerHTML = `
            <h4>${post.username}</h4>
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

                    const username = userDoc.data().username || "Unknown User";

                    const userPosts = await userRef.collection('posts')
                        .orderBy("createdAt", "desc")
                        .get();

                    const postsContainer = document.getElementById('postsContainer');
                    postsContainer.innerHTML = ''; // Clear current posts

                    userPosts.forEach(doc => {
                        addPostToDOM({
                            id: doc.id,
                            content: doc.data().content,
                            username: username,
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
