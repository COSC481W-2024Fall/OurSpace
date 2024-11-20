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

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const userCredential = await auth.signInWithEmailAndPassword(username, password);
                const user = userCredential.user;

                // Check if the friends list exists, create one if not
                const userRef = db.collection('users').doc(username);
                const userDoc = await userRef.get();
                
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    if (!userData.friends) {
                        // If friends list doesn't exist, initialize it as an empty array
                        await userRef.update({ friends: [] });
                    }
                } else {
                    // Handle error if user data does not exist
                    console.error("User document does not exist.");
                }

                localStorage.setItem('loggedInUserId', username); // Store user ID
                window.location.href = 'homepage.html'; // Redirect to homepage
            } catch (error) {
                console.error("Error logging in:", error);
                alert("Error: " + error.message);
            }
        });
    }
});
