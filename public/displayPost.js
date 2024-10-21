function loadPosts() {
    const db = firebase.firestore();
    const postsContainer = document.getElementById('postsContainer');  // This is where posts will be rendered
    
    // Clear any existing content
    postsContainer.innerHTML = '';

    db.collection('posts').orderBy('createdAt', 'desc').get().then((snapshot) => {
        snapshot.forEach((doc) => {
            const post = doc.data();
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            
            // Fetch the username from Firestore based on userId
            db.collection('users').doc(post.userId).get().then((userDoc) => {
                const username = userDoc.data().username;
                
                // Create a post display
                postElement.innerHTML = `
                    <h4>${username}</h4>
                    <p>${post.content}</p>
                    <small>${new Date(post.createdAt.seconds * 1000).toLocaleString()}</small>
                `;
                postsContainer.appendChild(postElement);
            });
        });
    }).catch((error) => {
        console.error("Error loading posts:", error);
    });
}
