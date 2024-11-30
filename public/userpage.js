// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

let isEditing = false;
let originalBio = "";
let originalProfilePic = "";
let cropper;

// Function to toggle the editing mode
function toggleEdit() {
    const bioInput = document.getElementById('bioInput');
    const bioDisplay = document.getElementById('bioDisplay');
    const fileInput = document.getElementById('fileInput');
    const imagePreview = document.getElementById('imagePreview');
    const saveButton = document.getElementById('saveButton');
    const discardButton = document.getElementById('discardButton');
    const cropContainer = document.querySelector('.crop-container');

    isEditing = !isEditing;

    if (isEditing) {
        // Show edit buttons and input fields
        document.getElementById('editButton').style.display = 'none';
        saveButton.style.display = 'inline-block';
        discardButton.style.display = 'inline-block';
        cropContainer.style.display = 'block';
        document.getElementById("homeButton").style.display = 'none';
        document.getElementById("signOutButton").style.display = 'none';

        bioInput.style.display = 'block';
        bioDisplay.style.display = 'none';
        bioInput.value = originalBio;

        fileInput.style.display = 'block';
        imagePreview.style.display = 'block';
    } else {
        // Hide edit buttons and return to normal view
        document.getElementById('editButton').style.display = 'inline-block';
        saveButton.style.display = 'none';
        discardButton.style.display = 'none';
        document.getElementById("homeButton").style.display = 'inline-block';
        document.getElementById("signOutButton").style.display = 'inline-block';

        bioInput.style.display = 'none';
        bioDisplay.style.display = 'block';
        fileInput.style.display = 'none';
        imagePreview.style.display = 'none';
        cropContainer.style.display = 'none';
    }
}

// Handle image file selection and initialize the cropper
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = function() {
            const imageURL = reader.result;

            // Show preview
            document.getElementById('imagePreview').src = imageURL;
            document.getElementById('imageToCrop').src = imageURL;

            // Initialize or reset cropper
            if (cropper) {
                cropper.destroy();
            }

            cropper = new Cropper(document.getElementById('imageToCrop'), {
                aspectRatio: 1, 
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 0.8,
                scalable: true,
                cropBoxResizable: true,
                cropBoxMovable: true,
                ready() {
                    const cropBox = this.cropper.cropBox;
                    cropBox.style.borderRadius = '50%'; 
                    cropBox.style.overflow = 'hidden';
                }
            });
        };
        reader.readAsDataURL(file);
    }
});

// Save changes to Firestore 
async function saveChanges() {
    const bioInput = document.getElementById('bioInput');
    const bioDisplay = document.getElementById('bioDisplay');
    const username = document.getElementById('username').innerText;
    const bio = bioInput.value;

    bioDisplay.innerText = bio;
    let imageUrl = originalProfilePic;

    // If a new profile picture was selected and cropped, upload it to Firebase
    if (cropper) {
        const canvas = cropper.getCroppedCanvas({ width: 200, height: 200 });
        const croppedImageUrl = canvas.toDataURL();
        imageUrl = croppedImageUrl;
    }

    // Update Firestore with new bio and profile picture URL
    try {
        if (imageUrl !== originalProfilePic) {
            await uploadCroppedImageToFirebase(imageUrl);
        }

        await db.collection("users").doc(auth.currentUser.uid).update({
            bio: bio,
            profilePic: imageUrl
        });

        document.getElementById('profilePic').style.backgroundImage = `url(${imageUrl})`;

        console.log("Profile updated successfully!");
    } catch (error) {
        console.error("Error saving profile:", error);
    }

    toggleEdit();
}

// Upload cropped image to Firebase Storage
async function uploadCroppedImageToFirebase(croppedImageUrl) {
    const user = firebase.auth().currentUser;
    const storageRef = firebase.storage().ref();
    const profilePicRef = storageRef.child(`profile_pictures/${user.uid}.jpg`);
    const response = await fetch(croppedImageUrl);
    const blob = await response.blob();

    try {
        await profilePicRef.put(blob);
        const downloadUrl = await profilePicRef.getDownloadURL();

        await firebase.firestore().collection("users").doc(user.uid).update({
            profilePic: downloadUrl
        });

        console.log("Profile picture updated successfully!");
    } catch (error) {
        console.error("Error uploading cropped image:", error);
    }
}

// Discard changes
function discardChanges() {
    const bioInput = document.getElementById('bioInput');
    bioInput.value = originalBio;
    document.getElementById('fileInput').value = "";
    document.getElementById('imagePreview').src = originalProfilePic;
    toggleEdit();
}

// Load user data when page loads
document.addEventListener('DOMContentLoaded', async function () {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const username = user.email.split('@')[0];
            const userDoc = await db.collection("users").doc(user.uid).get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                document.getElementById('username').innerText = userData.username;
                document.getElementById('bioDisplay').innerText = userData.bio || "No bio available";
                originalProfilePic = userData.profilePic || "";
                document.getElementById('profilePic').style.backgroundImage = `url(${originalProfilePic})`;
                originalBio = userData.bio || "";
            } else {
                console.log("No such document!");
                await db.collection("users").doc(user.uid).set({
                    username: user.email.split('@')[0],
                    bio: "",
                    profilePic: ""  
                });
                document.getElementById('bioDisplay').innerText = "No bio available";
                document.getElementById('profilePic').style.backgroundColor = "#ccc";
            }
        } else {
            console.log("No user is signed in.");
        }
    });
});
