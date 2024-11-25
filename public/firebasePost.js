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
                const userId = user.uid; // Use UID instead of email
                console.log("Attempting to add post:", postContent, "by user UID:", userId);

                if (postContent) {
                    try {
                        const userRef = db.collection('users').doc(userId);
                        await userRef.collection('posts').add({
                            content: postContent,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        document.getElementById('postContent').value = ''; // Clear the form
                        
                        // Update DOM immediately
                        const newPost = {
                            content: postContent,
                            userId: userId,
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

    loadPosts();  // Load existing posts on page load

    // Function to add a post to the DOM
    function addPostToDOM(post) {
        const postsContainer = document.getElementById('postsContainer');
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // Fetch the username from Firestore based on UID
        db.collection('users').doc(post.userId).get().then((userDoc) => {
            const username = userDoc.data().username || "Unknown User";

            // Create a post display
            postElement.innerHTML = `
                <h4>${username}</h4>
                <p>${post.content}</p>
                <small>${post.createdAt.toLocaleString()}</small>
            `;
            postsContainer.prepend(postElement);  // Add the new post to the top of the container
        }).catch(error => {
            console.error("Error fetching username:", error);
        });
    }

    // Load posts for the currently logged-in user
    async function loadPosts() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userId = user.uid; // Use UID
                try {
                    const userPosts = await db.collection('users').doc(userId).collection('posts')
                        .orderBy("createdAt", "desc")
                        .get();

                    userPosts.forEach(doc => {
                        addPostToDOM({
                            content: doc.data().content,
                            userId: userId,
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
