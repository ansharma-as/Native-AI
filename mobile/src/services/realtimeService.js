import apiService from './api';

class RealtimeService {
  constructor() {
    this.pollingIntervals = new Map();
    this.listeners = new Map();
    this.isConnected = true; // REST is always "connected"
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Start polling for a specific chat
  startChatPolling(chatId, interval = 3000) {
    if (this.pollingIntervals.has(chatId)) {
      return; // Already polling
    }

    console.log(`Starting chat polling for ${chatId}`);
    
    let lastMessageCount = 0;
    
    const poll = async () => {
      try {
        const response = await apiService.getChat(chatId);
        const chat = response.data || response;
        
        if (chat && chat.messages) {
          const currentMessageCount = chat.messages.length;
          
          // Check for new messages
          if (currentMessageCount > lastMessageCount) {
            const newMessages = chat.messages.slice(lastMessageCount);
            
            newMessages.forEach(message => {
              this.emit('message_received', {
                chatId,
                message,
                type: message.role === 'user' ? 'user_message' : 'ai_response'
              });
            });
            
            lastMessageCount = currentMessageCount;
          }
          
          // Emit chat updated event
          this.emit('chat_updated', { chatId, chat });
        }
      } catch (error) {
        console.error(`Error polling chat ${chatId}:`, error);
        this.emit('polling_error', { chatId, error: error.message });
      }
    };

    // Initial poll
    poll();
    
    // Set up interval
    const intervalId = setInterval(poll, interval);
    this.pollingIntervals.set(chatId, intervalId);
  }

  // Stop polling for a specific chat
  stopChatPolling(chatId) {
    if (this.pollingIntervals.has(chatId)) {
      clearInterval(this.pollingIntervals.get(chatId));
      this.pollingIntervals.delete(chatId);
      console.log(`Stopped chat polling for ${chatId}`);
    }
  }

  // Stop all polling
  stopAllPolling() {
    this.pollingIntervals.forEach((intervalId, chatId) => {
      clearInterval(intervalId);
      console.log(`Stopped polling for ${chatId}`);
    });
    this.pollingIntervals.clear();
  }

  // Poll for chat list updates
  startChatsListPolling(interval = 5000) {
    if (this.pollingIntervals.has('chats_list')) {
      return;
    }

    console.log('Starting chats list polling');
    
    const poll = async () => {
      try {
        const chats = await apiService.getChats();
        this.emit('chats_updated', chats);
      } catch (error) {
        console.error('Error polling chats list:', error);
        this.emit('polling_error', { type: 'chats_list', error: error.message });
      }
    };

    // Initial poll
    poll();
    
    // Set up interval
    const intervalId = setInterval(poll, interval);
    this.pollingIntervals.set('chats_list', intervalId);
  }

  // Stop chats list polling
  stopChatsListPolling() {
    if (this.pollingIntervals.has('chats_list')) {
      clearInterval(this.pollingIntervals.get('chats_list'));
      this.pollingIntervals.delete('chats_list');
      console.log('Stopped chats list polling');
    }
  }

  // Send message with optimistic update
  async sendMessage(chatId, message, useOffline = false) {
    try {
      // Emit optimistic update
      this.emit('message_sent', { chatId, message, useOffline });
      
      const response = await apiService.sendMessage(chatId, message, useOffline);
      return response;
    } catch (error) {
      this.emit('send_error', { chatId, error: error.message });
      throw error;
    }
  }

  // Simulate typing indicators
  simulateTyping(chatId, isTyping, isAI = false) {
    this.emit(isAI ? 'ai_typing' : 'user_typing', {
      chatId,
      isTyping,
      userId: isAI ? 'ai' : 'user'
    });
  }

  // Connection methods for compatibility
  async connect() {
    this.isConnected = true;
    this.emit('connected');
    return true;
  }

  disconnect() {
    this.stopAllPolling();
    this.isConnected = false;
    this.emit('disconnected');
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      activePolls: this.pollingIntervals.size
    };
  }

  // Check if currently polling
  isPollingChat(chatId) {
    return this.pollingIntervals.has(chatId);
  }
}

// Create singleton instance
const realtimeService = new RealtimeService();

export default realtimeService;