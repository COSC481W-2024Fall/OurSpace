// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCppKyFDiC6qSWoS25mP4f-7DUfJ05BWl8",
    authDomain: "ourspace-9703c.web.app",
    projectId: "ourspace-9703c",
    storageBucket: "ourspace-9703c.appspot.com",
    messagingSenderId: "829335148222",
    appId: "1:829335148222:web:94ebc43b2d3ea171e1b0ef",
    measurementId: "G-T3YWVB2JGV"
  };
  
  // Initialize Firebase app
  firebase.initializeApp(firebaseConfig);
  
  // Get Firebase services
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // Handle form submission for sign-up
  const signupForm = document.getElementById('signupForm');
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
  
    // Password confirmation check
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    try {
      // Check if the username is already taken in Firestore
      const userRef = db.collection('users').doc(username);
      const userDoc = await userRef.get();
  
      if (userDoc.exists) {
        alert("Username is already in use");
        return;
      }
  
      // Create user with Firebase Authentication using email (username is treated as email)
      const userCredential = await auth.createUserWithEmailAndPassword(username, password);
      const user = userCredential.user;
  
      // Save user data to Firestore
      const userData = {
        name: name,
        username: username,
        bio: "",
        profilePic: "",
        friends: [] 
      };
  
      await db.collection('users').doc(user.uid).set(userData);
  
      // Redirect to login page after successful sign-up
      window.location.href = 'login.html'; 
  
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error: " + error.message);
    }
  });
  