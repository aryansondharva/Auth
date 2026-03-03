const express = require('express');
const { getLinkedInProfile, getGitHubProfile } = require('../controllers/socialController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get LinkedIn profile data
router.get('/linkedin/:username', protect, getLinkedInProfile);

// Get GitHub profile data
router.get('/github/:username', protect, getGitHubProfile);

module.exports = router;
