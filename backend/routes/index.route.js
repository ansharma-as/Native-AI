const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.route');
const chatRoutes = require('./chat.route');

// Mount routes
router.use('/auth', authRoutes);
router.use('/chats', chatRoutes);

// Health check route
router.get('/', (req, res) => {
  res.send('API is running');
});

module.exports = router;