import axios from 'axios';
import api from './api';
import * as SecureStore from 'expo-secure-store';



class ChatService {
    
  // Get all chats for the current user
  async getChats() {
    const secureToken = await SecureStore.getItemAsync('authToken')

    try {
      const response = await axios.get('https://3d53-103-47-74-66.ngrok-free.app/api/chats' ,{
        headers: {
          Authorization: `Bearer ${secureToken}`,
        },
      })
    //   console.log('Fetched chats:', response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw error;
    }
  }

  // Get a specific chat by ID
  async getChat(chatId) {
    if (!chatId) {
      throw new Error('Chat ID is required');
    }
    const secureToken = await SecureStore.getItemAsync('authToken');
    try {
      const response = await api.get(`https://3d53-103-47-74-66.ngrok-free.app/api/chats/${chatId}` , {
        headers: {
            Authorization: `Bearer ${secureToken}`,
          },
      });
      return response;
    } catch (error) {
      console.error(`Error fetching chat ${chatId}:`, error);
      throw error;
    }
  }

  // Create a new chat
  async createChat(title = 'New Chat') {
    try {
      const response = await api.post('https://3d53-103-47-74-66.ngrok-free.app/api/chats', { title });
      return response;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  // Delete a chat
  async deleteChat(chatId) {
    if (!chatId) {
      throw new Error('Chat ID is required');
    }
    
    try {
      await api.delete(`/api/chats/${chatId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting chat ${chatId}:`, error);
      throw error;
    }
  }

  // Send a message in a chat
  async sendMessage(chatId, message, useOfflineMode = false) {
    if (!chatId) {
      throw new Error('Chat ID is required');
    }
    
    if (!message || message.trim() === '') {
      throw new Error('Message cannot be empty');
    }
    
    try {
      const response = await api.post(`https://3d53-103-47-74-66.ngrok-free.app/api/chats/${chatId}/messages`, {
        userMessage: message,
        useOfflineMode
      });
      
      return response;
    } catch (error) {
      console.error(`Error sending message in chat ${chatId}:`, error);
      throw error;
    }
  }

  // Check offline model status
  async checkModelStatus() {
    try {
      const response = await api.get('https://3d53-103-47-74-66.ngrok-free.app/api/chats/model/status');
      return {
        isDownloaded: response.isDownloaded || false,
        downloadProgress: response.downloadProgress || 0,
        ...response
      };
    } catch (error) {
      console.error('Error checking model status:', error);
      // Return default values on error instead of throwing
      return { isDownloaded: false, downloadProgress: 0 };
    }
  }

  // Download offline model
  async downloadOfflineModel() {
    try {
      const response = await api.post('https://3d53-103-47-74-66.ngrok-free.app/api/chats/model/download');
      return response;
    } catch (error) {
      console.error('Error downloading offline model:', error);
      throw error;
    }
  }
  
  // Helper method to format chat data (if needed)
  _formatChatData(chat) {
    if (!chat) return null;
    
    // Ensure messages array exists
    const messages = chat.messages || [];
    
    // Add any other formatting needed
    return {
      ...chat,
      messages,
      updatedAt: chat.updatedAt || new Date().toISOString()
    };
  }
}

// Create and export a singleton instance
const chatService = new ChatService();
export default chatService;