
// src/controllers/chatController.js
const Chat = require('../models/Chat');
const User = require('../models/User');
const aiService = require('../services/aiService');

// Get all chats for a user
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .select('title updatedAt messages.length');
    
    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single chat
exports.getChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    const { title } = req.body;
    
    const chat = await Chat.create({
      userId: req.user.id,
      title: title || 'New Chat',
      messages: []
    });
    
    res.status(201).json({
      success: true,
      data: chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Send a message in a chat
exports.sendMessage = async (req, res) => {
  try {
    const { message, useOffline } = req.body;
    const chatId = req.params.id;
    
    // Find the chat
    const chat = await Chat.findOne({
      _id: chatId,
      userId: req.user.id
    });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    // Get AI service based on preference
    const service = await aiService.getAIService(useOffline);
    
    // Analyze sentiment
    const sentimentType = service.analyzeSentiment(message);
    
    // Add user message to chat
    chat.messages.push({
      role: 'user',
      content: message,
      sentiment: sentimentType
    });
    
    // Get supportive response based on sentiment
    const supportiveResponse = service.getSupportiveResponse(sentimentType, message);
    
    // Generate AI response using appropriate model
    const aiResponse = await service.generateText(
      message, 
      chat.messages.slice(-10) // Use last 10 messages as context
    );
    
    // Add AI response to chat
    chat.messages.push({
      role: 'assistant',
      content: aiResponse,
      generatedOffline: useOffline
    });
    
    // Save updated chat
    await chat.save();
    
    res.status(200).json({
      success: true,
      data: {
        chat,
        supportiveResponse
      }
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a chat
exports.deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    await chat.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Download offline model
exports.downloadModel = async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Start model download (this will be a long-running process)
    res.status(202).json({
      success: true,
      message: 'Model download started'
    });
    
    // Continue download in background
    try {
      await aiService.downloadOfflineModel();
      
      // Update user preferences
      user.modelDownloaded = true;
      await user.save();
      
      console.log('Model download completed for user:', user._id);
    } catch (error) {
      console.error('Model download failed:', error);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Check model download status
exports.checkModelStatus = async (req, res) => {
  try {
    const isDownloaded = await aiService.isModelDownloaded();
    
    res.status(200).json({
      success: true,
      isDownloaded
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};