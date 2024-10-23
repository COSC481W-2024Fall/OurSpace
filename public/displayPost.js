function loadPosts() {

    const firebaseConfig = {
        apiKey: "AIzaSyCppKyFDiC6qSWoS25mP4f-7DUfJ05BWl8",
        authDomain: "ourspace-9703c.firebaseapp.com",
        projectId: "ourspace-9703c",
        storageBucket: "ourspace-9703c.appspot.com",
        messagingSenderId: "829335148222",
        appId: "1:829335148222:web:94ebc43b2d3ea171e1b0ef",
        measurementId: "G-T3YWVB2JGV"
    };
    
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
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
