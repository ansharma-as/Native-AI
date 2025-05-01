const express = require('express');
const router = express.Router();
const { 
  getChats, 
  getChat, 
  createChat, 
  sendMessage, 
  deleteChat,
  downloadModel,
  checkModelStatus
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// Protect all chat routes
router.use(protect);

// Chat routes
router.route('/')
  .get(getChats)
  .post(createChat);

router.route('/:id')
  .get(getChat)
  .delete(deleteChat);

router.post('/:id/messages', sendMessage);

// Model management routes
router.post('/model/download', downloadModel);
router.get('/model/status', checkModelStatus);

module.exports = router;