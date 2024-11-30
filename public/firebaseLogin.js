import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {
    const firebaseConfig = {
        apiKey: "AIzaSyCppKyFDiC6qSWoS25mP4f-7DUfJ05BWl8",
        authDomain: "ourspace-9703c.web.app",
        projectId: "ourspace-9703c",
        storageBucket: "ourspace-9703c.appspot.com",
        messagingSenderId: "829335148222",
        appId: "1:829335148222:web:94ebc43b2d3ea171e1b0ef",
        measurementId: "G-T3YWVB2JGV"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const userCredential = await signInWithEmailAndPassword(auth, username, password);
                const user = userCredential.user;

                // Check if the friends list exists, create one if not
                const userRef = doc(db, 'users', username);
                const userDoc = await getDoc(userRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (!userData.friends) {
                        // If friends list doesn't exist, initialize it as an empty array
                        await updateDoc(userRef, { friends: [] });
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
