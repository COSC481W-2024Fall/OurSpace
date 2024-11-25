document.addEventListener('DOMContentLoaded', function () {
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
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            // Check if the user already exists based on the username (no need to use it for doc ID)
            const userRef = db.collection("users").doc(username); // Using username directly for checking

            const userDoc = await userRef.get();
            if (userDoc.exists) {
                alert("Username is already in use");
                return;
            }

            // Create user with Firebase Authentication
            const userCredential = await auth.createUserWithEmailAndPassword(username + "@domain.com", password); // Use a dummy domain for the email
            const user = userCredential.user;

            // User data to be stored in Firestore
            const userData = {
                name: name,
                username: username,
                bio: "",
                profilePic: "",
                posts: "",
                friends: [] // Initialize the friends field as an empty array
            };

            // Store user data in Firestore under the user's UID (instead of username)
            const userDocRef = db.collection("users").doc(user.uid); // Use UID as document ID
            await userDocRef.set(userData);

            console.log("User document created:", userData);

            window.location.href = 'login.html'; // Redirect after successful sign-up

        } catch (error) {
            console.error("Error creating user:", error);
            alert("Error: " + error.message);
        }
    });
});
