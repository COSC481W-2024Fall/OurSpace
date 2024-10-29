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

        const userRef = db.collection("users").doc(username);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            alert("Username is already in use");
            return;
        }

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(username, password);
            const user = userCredential.user;

            const userData = { name: name, username: username, bio: "", profileColor: "#ccc" , posts: ""}; 
            await userRef.set(userData);
            console.log("User document created:", userData);

            window.location.href = 'login.html';
        } catch (error) {
            console.error("Error creating user:", error);
            alert("Error: " + error.message);
        }
    });
});
