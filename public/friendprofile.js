// Your web app's Firebase configuration
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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth(); // Initialize auth

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let userId = urlParams.get('userId'); // The profile user ID from the URL

    if (!userId) {
        alert("No user ID provided.");
        return;
    }

    // Check if userId is not an email and map it to an email if needed
    const usersCollection = await db.collection('users').get();
    let mappedUserId = null;

    usersCollection.forEach(doc => {
        const data = doc.data();
        if (doc.id === userId || data.username === userId) {
            mappedUserId = doc.id; // Use the email (doc.id) as the key
        }
    });

    if (!mappedUserId) {
        alert("User not found.");
        return;
    }

    userId = mappedUserId; // Normalize to email identifier

    // Fetch and display profile info using the normalized userId
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
        const userData = userDoc.data();
        document.getElementById('username').innerText = userData.username || "Username not found";
        document.getElementById('bio').innerText = userData.bio || "No bio available";

        if (userData.profilePic) {
            document.getElementById('profilePic').style.backgroundImage = `url(${userData.profilePic})`;
        } else {
            document.getElementById('profilePic').style.backgroundColor = "#ccc";
        }

        // Fetch and display user's posts
        const postsContainer = document.getElementById('postsContainer');
        if (!postsContainer) {
            console.warn("postsContainer element not found.");
            return;
        }

        postsContainer.innerHTML = ''; // Clear container before loading posts

        db.collection('users').doc(userId).collection('posts').orderBy('createdAt', 'desc').get()
        .then((postsSnapshot) => {
            if (postsSnapshot.empty) {
                console.log("No posts available for this user.");
                return;
            }

            postsSnapshot.forEach((postDoc) => {
                const post = postDoc.data();

                if (post.content && post.createdAt) {
                    const postElement = document.createElement('div');
                    postElement.classList.add('post');
                    postElement.innerHTML = `
                        <h4>${userData.username || "Unknown User"}</h4>
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
        alert("User not found.");
        return;
    }
});
