const express = require('express');
const router = express.Router();
const { db } = require('../firebaseConfig'); // Import your Firebase configuration

// Route to fetch user profile by user ID
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      res.json(userDoc.data());
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

// Route to fetch friend profiles
router.get('/friend/:friendId', async (req, res) => {
  const { friendId } = req.params;
  try {
    const friendDoc = await db.collection('users').doc(friendId).get();
    if (friendDoc.exists) {
      res.json(friendDoc.data());
    } else {
      res.status(404).json({ error: 'Friend not found' });
    }
  } catch (error) {
    console.error("Error fetching friend profile:", error);
    res.status(500).json({ error: 'Error fetching friend profile' });
  }
});

module.exports = router;
