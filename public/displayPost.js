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
    const postsContainer = document.getElementById('postsContainer');
    const userEmail = localStorage.getItem('loggedInUserId'); // Get logged-in user's email

    if (!postsContainer) {
        console.warn("postsContainer element not found.");
        return;
    }

    if (!userEmail) {
        console.warn("No logged-in user found in localStorage.");
        return;
    }

    postsContainer.innerHTML = ''; // Clear container before loading posts

    // Access the current user's document
    db.collection('users').doc(userEmail).get().then((userDoc) => {
        if (userDoc.exists) {
            const username = userDoc.data().username || "Unknown User";

            // Access the user's posts sub-collection
            db.collection('users').doc(userEmail).collection('posts').orderBy('createdAt', 'desc').get()
            .then((postsSnapshot) => {
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
            }).catch((error) => {
                console.error("Error fetching posts:", error);
            });
        } else {
            console.error("User document not found for logged-in user.");
        }
    }).catch((error) => {
        console.error("Error fetching user data:", error);
    });
});
