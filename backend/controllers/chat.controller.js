// src/controllers/chatController.js
const Chat = require('../models/chat.model');
const User = require('../models/user.model');
const aiService = require('../services/ai.service');

// Get all chats for a user (limited to last 10)
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('title updatedAt model_type createdAt');
    
    // Add message count
    const chatsWithCount = chats.map(chat => ({
      ...chat.toObject(),
      messageCount: chat.messages ? chat.messages.length : 0
    }));
    
    res.status(200).json({
      success: true,
      count: chatsWithCount.length,
      data: chatsWithCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Search chats
exports.searchChats = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const chats = await Chat.find({
      userId: req.user.id,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { 'messages.content': { $regex: query, $options: 'i' } }
      ]
    })
    .sort({ updatedAt: -1 })
    .limit(10)
    .select('title updatedAt model_type createdAt');
    
    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats,
      query
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
    const { title, model_type = 'online' } = req.body;
    
    // Maintain 10-chat limit before creating new chat
    await Chat.maintainChatLimit(req.user.id, 10);
    
    const chat = await Chat.create({
      userId: req.user.id,
      title: title || 'New Chat',
      model_type,
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
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
      sentiment: sentimentType
    };
    
    chat.messages.push(userMessage);
    
    // Update model type if different
    if (chat.model_type !== (useOffline ? 'offline' : 'online')) {
      chat.model_type = useOffline ? 'offline' : 'online';
    }
    
    // Save chat with user message first
    await chat.save();
    
    try {
      // Generate AI response using appropriate model
      const aiResponse = await service.generateText(
        message, 
        chat.messages.slice(-10) // Use last 10 messages as context
      );
      
      // Add AI response to chat
      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        generatedOffline: useOffline,
        sentiment: 'neutral'
      };
      
      chat.messages.push(assistantMessage);
      
      // Save updated chat
      await chat.save();
      
      // Get supportive response based on sentiment
      const supportiveResponse = service.getSupportiveResponse(sentimentType, message);
      
      res.status(200).json({
        success: true,
        data: {
          chat: chat,
          userMessage,
          assistantMessage,
          supportiveResponse,
          chatId
        }
      });
      
    } catch (aiError) {
      console.error('AI Error:', aiError);
      
      res.status(500).json({
        success: false,
        message: 'Failed to generate AI response',
        error: aiError.message
      });
    }
    
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