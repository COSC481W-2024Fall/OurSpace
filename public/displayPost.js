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

                        // Check if the post has the required fields
                        if (post.content && post.createdAt) {
                            const postElement = document.createElement('div');
                            postElement.classList.add('post');
                            postElement.innerHTML = `
                                <h4>${username}</h4>
                                <p>${post.content}</p>
                                <small>${new Date(post.createdAt.seconds * 1000).toLocaleString()}</small>
                            `;
                            postsContainer.appendChild(postElement);
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
});
