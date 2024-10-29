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
    
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const userCredential = await auth.signInWithEmailAndPassword(username, password);
                const user = userCredential.user;
                
                localStorage.setItem('loggedInUserId', username); // use user.uid
                window.location.href = 'homepage.html';
            } catch (error) {
                console.error("Error logging in:", error);
                alert("Error: " + error.message);
            }
        });
    }
    
    });
    