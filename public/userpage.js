let isEditing = false;
let originalBio = "";
let originalColor = "#ccc";

function toggleEdit() {
    const bioInput = document.getElementById('bioInput');
    const colorPicker = document.getElementById('colorPicker');
    const profilePic = document.getElementById('profilePic');
    const usernameSpan = document.getElementById('username');
    const editButtons = document.querySelector('.edit-buttons');

    isEditing = !isEditing;

    if (isEditing) {
        originalBio = bioInput.value;
        originalColor = colorPicker.value;
        bioInput.style.display = 'block';
        colorPicker.style.display = 'block';
        usernameSpan.style.display = 'none';
        editButtons.style.display = 'block';
    } else {
        bioInput.style.display = 'none';
        colorPicker.style.display = 'none';
        usernameSpan.style.display = 'inline';
        editButtons.style.display = 'none';
    }
}

function saveChanges() {
    const bioInput = document.getElementById('bioInput');
    const colorPicker = document.getElementById('colorPicker');
    const profilePic = document.getElementById('profilePic');
    const usernameSpan = document.getElementById('username');

    profilePic.style.backgroundColor = colorPicker.value;
    usernameSpan.innerText = usernameSpan.innerText; // Keep username the same
    bioInput.style.display = 'none';
    colorPicker.style.display = 'none';
    usernameSpan.style.display = 'inline';
    isEditing = false;
    document.querySelector('.edit-buttons').style.display = 'none';
}

function discardChanges() {
    const bioInput = document.getElementById('bioInput');
    const colorPicker = document.getElementById('colorPicker');
    const profilePic = document.getElementById('profilePic');

    bioInput.value = originalBio;
    colorPicker.value = originalColor;
    profilePic.style.backgroundColor = originalColor;

    toggleEdit();
}