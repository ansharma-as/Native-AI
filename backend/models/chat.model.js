// src/models/Chat.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  generatedOffline: {
    type: Boolean,
    default: false
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  }
});

const ChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [MessageSchema],
  model_type: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps
ChatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to maintain 10-chat limit per user
ChatSchema.statics.maintainChatLimit = async function(userId, maxChats = 10) {
  const chatCount = await this.countDocuments({ userId });
  
  if (chatCount >= maxChats) {
    // Find oldest chats to delete
    const excessChats = chatCount - maxChats + 1;
    const oldestChats = await this.find({ userId })
      .sort({ createdAt: 1 })
      .limit(excessChats)
      .select('_id');
    
    const chatIds = oldestChats.map(chat => chat._id);
    await this.deleteMany({ _id: { $in: chatIds } });
    
    console.log(`Deleted ${excessChats} oldest chats for user ${userId}`);
  }
};

module.exports = mongoose.model('Chat', ChatSchema);