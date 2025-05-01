const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe,
  updatePreferences 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Register and login routes (public)
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);

module.exports = router;
