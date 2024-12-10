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

                // Fetch user data from Firestore using UID, not username
                const userRef = doc(db, 'users', user.uid);  // Using UID instead of email/username for reference
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    
                    // Use the user's name if available, otherwise fallback to username or email
                    const userName = userData.name || user.email.split('@')[0]; // Fallback to email username if no name field is present
                    localStorage.setItem('loggedInUserId', userName); // Store userName (or email) in local storage

                    // Optionally, you can store additional user info like the user's bio or profile pic if needed
                    console.log(`Welcome back, ${userName}!`);

                    // Redirect to homepage after successful login
                    window.location.href = 'homepage.html';
                } else {
                    console.error("User document does not exist.");
                }
            } catch (error) {
                console.error("Error logging in:", error);
                alert("Error: " + error.message);
            }
        });
    }
});
