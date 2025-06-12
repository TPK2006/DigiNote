const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const router = express.Router();

// Ensure assets directory exists
const assetsDir = path.join(__dirname, '../assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// Route: Save User Data
router.post('/save-user', async (req, res) => {
  try {
    const { id, name, email, profilePicture, googleId } = req.body;
    
    // Download and save profile picture
    const imageName = `${googleId}.jpg`;
    const imagePath = path.join(__dirname, '../assets', imageName);
    const imageUrl = profilePicture;
    
    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(imagePath, Buffer.from(response.data));
    } catch (error) {
      console.error('Error saving profile picture:', error);
      return res.status(500).json({ error: 'Failed to save profile picture' });
    }

    // Save user data to MongoDB
    const user = await User.findOneAndUpdate(
      { googleId },
      {
        name,
        email,
        profilePicturePath: `../assets/${imageName}`,
        googleId
      },
      { upsert: true, new: true }
    );

    res.json({ 
      message: 'User data saved successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicturePath: user.profilePicturePath,
        googleId: user.googleId
      }
    });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ error: 'Failed to save user data' });
  }
});

// Route: Get User Data by Google ID
router.get('/get-user/:googleId', async (req, res) => {
  try {
    const { googleId } = req.params;
    const user = await User.findOne({ googleId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicturePath: user.profilePicturePath,
        googleId: user.googleId
      }
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

module.exports = router;