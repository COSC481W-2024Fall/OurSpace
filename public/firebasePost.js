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
        const userEmail = localStorage.getItem('loggedInUserId');
        
        console.log("Attempting to add post:", postContent, "by user:", userEmail); // Debugging line
        
        if (postContent && userEmail) {
            try {
                const userRef = db.collection('users').doc(userEmail);
                await userRef.collection('posts').add({
                    content: postContent,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                console.log("Post successfully added to Firestore!"); // Success message
                alert("Post created successfully!");
                document.getElementById('postContent').value = ''; // Clear the form
                
                // Update DOM immediately
                const newPost = {
                    content: postContent,
                    userEmail: userEmail,
                    createdAt: new Date()
                };
                addPostToDOM(newPost);
    
            } catch (error) {
                console.error("Error creating post:", error);
                alert("Error: " + error.message);
            }
        } else {
            alert("Please log in and enter content to post.");
        }
    });
    
    loadPosts();  // Load existing posts on page load

    // Function to add a post to the DOM
    function addPostToDOM(post) {
        const postsContainer = document.getElementById('postsContainer');
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // Fetch the username from Firestore based on userEmail
        db.collection('users').doc(post.userEmail).get().then((userDoc) => {
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
        const userEmail = localStorage.getItem('loggedInUserId');
        if (userEmail) {
            try {
                const userPosts = await db.collection('users').doc(userEmail).collection('posts')
                    .orderBy("createdAt", "desc")
                    .get();

                userPosts.forEach(doc => {
                    addPostToDOM({
                        content: doc.data().content,
                        userEmail: userEmail,
                        createdAt: doc.data().createdAt.toDate()
                    });
                });
            } catch (error) {
                console.error("Error loading posts:", error);
            }
        }
    }
});

