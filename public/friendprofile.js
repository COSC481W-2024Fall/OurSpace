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
    const userId = urlParams.get('userId'); // The profile user ID from the URL

    if (!userId) {
        alert("No user ID provided.");
        return;
    }

    let userData; // Define userData outside the if block for broader scope

    // Fetch and display profile info
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
        userData = userDoc.data();
        document.getElementById('username').innerText = userData.username || "Username not found";
        document.getElementById('bio').innerText = userData.bio || "No bio available";
    } else {
        alert("User not found.");
        return;
    }

    // Fetch and display user's posts
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) {
        console.warn("postsContainer element not found.");
        return;
    }

    postsContainer.innerHTML = ''; // Clear container before loading posts

    // Access the user's posts sub-collection
    db.collection('users').doc(userId).collection('posts').orderBy('createdAt', 'desc').get()
    .then((postsSnapshot) => {
        if (postsSnapshot.empty) {
            console.log("No posts available for this user.");
            return;
        }

        postsSnapshot.forEach((postDoc) => {
            const post = postDoc.data();

            // Ensure required fields are present
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
});

// Sign out function
function signOut() { 
    auth.signOut().then(() => {
        console.log("User signed out successfully.");
        window.location.href = 'login.html'; 
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
}
