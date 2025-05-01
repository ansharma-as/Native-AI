const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const chatRoutes = require('./chat');

// Mount routes
router.use('/auth', authRoutes);
router.use('/chats', chatRoutes);

// Health check route
router.get('/', (req, res) => {
  res.send('API is running');
});

module.exports = router;