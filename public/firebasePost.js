document.addEventListener('DOMContentLoaded', function () {
    const db = firebase.firestore();

    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const postContent = document.getElementById('postContent').value;
            const userId = localStorage.getItem('loggedInUserId'); // Retrieve the logged-in user ID
            
            if (postContent && userId) {
                try {
                    // Add the post to Firestore
                    const postRef = await db.collection('posts').add({
                        content: postContent,
                        userId: userId,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    alert("Post created successfully!");
                    document.getElementById('postContent').value = '';  // Clear the form

                    // Immediately add the post to the DOM without refreshing the page
                    const newPost = {
                        content: postContent,
                        userId: userId,
                        createdAt: new Date()  // Use the current date until the Firestore timestamp syncs
                    };
                    addPostToDOM(newPost);  // Add the post to the DOM

                } catch (error) {
                    console.error("Error creating post:", error);
                    alert("Error: " + error.message);
                }
            } else {
                alert("Please log in and enter content to post.");
            }
        });
    }

    loadPosts();  // Load existing posts on page load

    // Function to add a post to the DOM
    function addPostToDOM(post) {
        const postsContainer = document.getElementById('postsContainer');
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // Fetch the username from Firestore based on userId
        db.collection('users').doc(post.userId).get().then((userDoc) => {
            const username = userDoc.data().username;

            // Create a post display
            postElement.innerHTML = `
                <h4>${username}</h4>
                <p>${post.content}</p>
                <small>${post.createdAt.toLocaleString()}</small>
            `;
            postsContainer.prepend(postElement);  // Add the new post to the top of the container
        });
    }
});
