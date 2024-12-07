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

    const db = firebase.firestore();
    const auth = firebase.auth();
    const postsContainer = document.getElementById('postsContainer');

    if (!postsContainer) {
        console.warn("postsContainer element not found.");
        return;
    }

    postsContainer.innerHTML = ''; // Clear container before loading posts

    // Wait for the user to authenticate
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userId = user.uid; // Get the user's UID
            console.log("Fetching posts for user UID:", userId);

            try {
                // Fetch the user's document
                const userDoc = await db.collection('users').doc(userId).get();
                if (userDoc.exists) {
                    const username = userDoc.data().username || "Unknown User";

                    // Fetch the user's posts
                    const postsSnapshot = await db
                        .collection('users')
                        .doc(userId)
                        .collection('posts')
                        .orderBy('createdAt', 'desc')
                        .get();

                    if (postsSnapshot.empty) {
                        console.log("No posts available for this user.");
                        return;
                    }

                    postsSnapshot.forEach((postDoc) => {
                        const post = postDoc.data();
                        const postId = postDoc.id;

                        // Check if the post has the required fields
                        if (post.content && post.createdAt) {
                            const postElement = document.createElement('div');
                            postElement.classList.add('post');
                            postElement.innerHTML = `
                                <h4>${username}</h4>
                                <p>${post.content}</p>
                                <small>${new Date(post.createdAt.seconds * 1000).toLocaleString()}</small>
                                <button class="like-btn" data-post-id="${postId}">Like</button>
                                <span class="likes-count">${post.likesCount || 0} likes</span>
                            `;
                            postsContainer.appendChild(postElement);

                            // Attach like button handler
                            attachLikeHandlerToButton(postElement.querySelector('.like-btn'), userId, postId);
                        } else {
                            console.warn("Post is missing content or createdAt fields:", post);
                        }
                    });
                } else {
                    console.error("User document not found for logged-in user.");
                }
            } catch (error) {
                console.error("Error fetching user data or posts:", error);
            }
        } else {
            console.warn("User is not logged in.");
        }
    });

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
});
