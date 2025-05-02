import { createContext, useState, useEffect, useContext } from 'react';
import { Alert, View, Text, ActivityIndicator } from 'react-native';
import chatService from '../services/chatService';
import { AuthContext } from './AuthContext';

export const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModelDownloaded, setIsModelDownloaded] = useState(false);
  const [isModelDownloading, setIsModelDownloading] = useState(false);
  const [modelDownloadProgress, setModelDownloadProgress] = useState(0);

  // Load chats when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
      checkOfflineModelStatus();
    }
  }, [isAuthenticated]);

  // Load all chats
  const loadChats = async () => {
    setLoading(true);
    try {
      const chatData = await chatService.getChats();
      setChats(chatData);
    } catch (err) {
      setError(err.message || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  // Load a specific chat
  const loadChat = async (chatId) => {
    setLoading(true);
    try {
      const chatData = await chatService.getChat(chatId);
      setCurrentChat(chatData);
      return chatData;
    } catch (err) {
      setError(err.message || 'Failed to load chat');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new chat
  const createChat = async (title = 'New Chat') => {
    setLoading(true);
    try {
      const newChat = await chatService.createChat(title);
      setChats((prevChats) => [...prevChats, newChat]);
      setCurrentChat(newChat);
      return newChat;
    } catch (err) {
      setError(err.message || 'Failed to create chat');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a chat
  const deleteChat = async (chatId) => {
    setLoading(true);
    try {
      await chatService.deleteChat(chatId);
      setChats((prevChats) => prevChats.filter(chat => chat.id !== chatId));
      
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete chat');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (chatId, message) => {
    // Use offline mode based on user preference if available
    const useOfflineMode = user?.preferences?.useOfflineMode || false;
    
    if (useOfflineMode && !isModelDownloaded) {
      Alert.alert(
        "Offline Model Not Downloaded",
        "You've selected offline mode, but the model isn't downloaded yet. Would you like to download it now or continue in online mode?",
        [
          {
            text: "Download Model",
            onPress: () => downloadOfflineModel()
          },
          {
            text: "Use Online Mode",
            onPress: async () => {
              try {
                const response = await chatService.sendMessage(chatId, message, false);
                updateChatWithNewMessage(chatId, message, response);
                return response;
              } catch (err) {
                setError(err.message || 'Failed to send message');
                return null;
              }
            }
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
      return null;
    }
    
    try {
      const response = await chatService.sendMessage(chatId, message, useOfflineMode);
      updateChatWithNewMessage(chatId, message, response);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to send message');
      return null;
    }
  };

  // Update chat with new message
  const updateChatWithNewMessage = (chatId, userMessage, response) => {
    // If we're updating the current chat
    if (currentChat && currentChat.id === chatId) {
      setCurrentChat(prevChat => {
        // Create new message objects
        const newUserMessage = {
          id: Date.now().toString(), // Temporary ID
          content: userMessage,
          sender: 'user',
          timestamp: new Date().toISOString()
        };
        
        const newAiMessage = {
          id: (Date.now() + 1).toString(), // Temporary ID
          content: response.aiResponse,
          sender: 'ai',
          sentiment: response.sentiment,
          suggestion: response.suggestion,
          timestamp: new Date().toISOString()
        };
        
        // Update messages array
        return {
          ...prevChat,
          messages: [...(prevChat.messages || []), newUserMessage, newAiMessage]
        };
      });
    }
    
    // Update the chat list to show the most recent message
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            lastMessage: response.aiResponse,
            updatedAt: new Date().toISOString()
          };
        }
        return chat;
      });
    });
  };

  // Check offline model status
  const checkOfflineModelStatus = async () => {
    try {
      const status = await chatService.checkModelStatus();
      setIsModelDownloaded(status.isDownloaded);
      setModelDownloadProgress(status.downloadProgress || 0);
      return status;
    } catch (err) {
      console.error('Failed to check model status:', err);
      return { isDownloaded: false, downloadProgress: 0 };
    }
  };

  // Download offline model
  const downloadOfflineModel = async () => {
    setIsModelDownloading(true);
    try {
      const downloadStatus = await chatService.downloadOfflineModel();
      
      // Poll for status updates
      const statusInterval = setInterval(async () => {
        const status = await checkOfflineModelStatus();
        setModelDownloadProgress(status.downloadProgress || 0);
        
        if (status.isDownloaded) {
          setIsModelDownloaded(true);
          setIsModelDownloading(false);
          clearInterval(statusInterval);
          Alert.alert("Download Complete", "The offline model has been downloaded successfully.");
        }
      }, 2000);
      
      return downloadStatus;
    } catch (err) {
      setError(err.message || 'Failed to download offline model');
      setIsModelDownloading(false);
      return null;
    }
  };

  // Loading indicator component with Tailwind styling
  const LoadingIndicator = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#5D5FEF" />
      <Text className="text-gray-600 mt-2">Loading...</Text>
    </View>
  );

  // Error message component with Tailwind styling
  const ErrorMessage = () => error && (
    <View className="bg-red-50 p-3 rounded-lg mb-4">
      <Text className="text-red-500">{error}</Text>
    </View>
  );

  // Clear error
  const clearError = () => setError(null);

  const value = {
    chats,
    currentChat,
    loading,
    error,
    isModelDownloaded,
    isModelDownloading,
    modelDownloadProgress,
    loadChats,
    loadChat,
    createChat,
    deleteChat,
    sendMessage,
    downloadOfflineModel,
    checkOfflineModelStatus,
    clearError,
    LoadingIndicator,
    ErrorMessage
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}