if (typeof firebase === 'undefined') {
    console.error("Firebase is not loaded.");
}

const auth = firebase.auth();
const db = firebase.firestore();
let isEditing = false;
let originalBio = "";
let originalColor = "#ccc"; 

function toggleEdit() {
    const bioInput = document.getElementById('bioInput');
    const bioDisplay = document.getElementById('bioDisplay');
    const colorPicker = document.getElementById('colorPicker');

    isEditing = !isEditing;

    if (isEditing) {
        document.getElementById('editButton').style.display = 'none';
        document.getElementById('addPostButton').style.display = 'none';
        document.getElementById('addFriendButton').style.display = 'none';
        document.getElementById('homeButton').style.display = 'none';

        document.getElementById('saveButton').style.display = 'inline-block';
        document.getElementById('discardButton').style.display = 'inline-block';

        originalBio = bioDisplay.innerText || ""; 
        bioInput.style.display = 'block'; 
        bioDisplay.style.display = 'none'; 
        bioInput.value = originalBio;

        colorPicker.style.display = 'inline'; 
        colorPicker.disabled = false; 
    } else {
        document.getElementById('editButton').style.display = 'inline-block';
        document.getElementById('addPostButton').style.display = 'inline-block';
        document.getElementById('addFriendButton').style.display = 'inline-block';
        document.getElementById('homeButton').style.display = 'inline-block';

        document.getElementById('saveButton').style.display = 'none';
        document.getElementById('discardButton').style.display = 'none';

        bioInput.style.display = 'none'; 
        bioDisplay.style.display = 'block'; 
        colorPicker.style.display = 'none'; 
        colorPicker.disabled = true; 
    }
}

async function saveChanges() {
    const bioInput = document.getElementById('bioInput');
    const bioDisplay = document.getElementById('bioDisplay');
    const username = document.getElementById('username').innerText;
    const colorPicker = document.getElementById('colorPicker');

    bioDisplay.innerText = bioInput.value; 
    const selectedColor = colorPicker.value;

    toggleEdit();

    try {
        await db.collection("users").doc(username).update({
            bio: bioInput.value,
            profileColor: selectedColor 
        });
        document.getElementById('profilePic').style.backgroundColor = selectedColor; 
        console.log("Bio and profile color successfully updated!");
    } catch (error) {
        console.error("Error updating bio:", error);
    }
}

function discardChanges() {
    const bioInput = document.getElementById('bioInput');
    bioInput.value = originalBio; 
    document.getElementById('colorPicker').value = originalColor; 
    toggleEdit(); 
}

function signOut() {
    auth.signOut().then(() => {
        console.log("User signed out successfully.");
        window.location.href = 'login.html'; 
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const username = user.email.split('@')[0]; 
            const userDoc = await db.collection("users").doc(username).get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                document.getElementById('username').innerText = userData.username;
                document.getElementById('bioDisplay').innerText = userData.bio || "No bio available"; 
                const profileColor = userData.profileColor || "#ccc"; 
                document.getElementById('colorPicker').value = profileColor; 
                document.getElementById('profilePic').style.backgroundColor = profileColor; 
                originalColor = profileColor; 
            } else {
                console.log("No such document!");
                await db.collection("users").doc(username).set({
                    username: username,
                    bio: "",
                    profileColor: "#ccc" 
                });
                document.getElementById('bioDisplay').innerText = "No bio available";
                document.getElementById('colorPicker').value = "#ccc"; 
                document.getElementById('profilePic').style.backgroundColor = "#ccc"; 
            }
        } else {
            console.log("No user is signed in.");
        }
    });
});
