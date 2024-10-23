function loadUserPosts(userId) {
    const db = firebase.firestore();
    const profilePostsContainer = document.getElementById('profilePostsContainer');
    
    profilePostsContainer.innerHTML = '';  // Clear existing posts

    db.collection('posts').where('userId', '==', userId).orderBy('createdAt', 'desc').get().then((snapshot) => {
        snapshot.forEach((doc) => {
            const post = doc.data();
            const postElement = document.createElement('div');
            postElement.classList.add('post');

            postElement.innerHTML = `
                <p>${post.content}</p>
                <small>${new Date(post.createdAt.seconds * 1000).toLocaleString()}</small>
            `;
            profilePostsContainer.appendChild(postElement);
        });
    }).catch((error) => {
        console.error("Error loading user posts:", error);
    });
}
