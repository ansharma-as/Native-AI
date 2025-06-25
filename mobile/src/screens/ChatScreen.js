import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import apiService from '../services/api';
import realtimeService from '../services/realtimeService';

// Message bubble component
const MessageBubble = ({ message, isUser, isDark }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Animated.View 
      style={{ opacity: fadeAnim }}
      className={`mb-4 ${isUser ? 'items-end' : 'items-start'}`}
    >
      <View className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser 
          ? (isDark ? 'bg-indigo-600' : 'bg-indigo-600')
          : (isDark ? 'bg-gray-700' : 'bg-white')
      } shadow-sm`}>
        <Text className={`text-base leading-6 ${
          isUser ? 'text-white' : (isDark ? 'text-gray-100' : 'text-gray-800')
        }`}>
          {message.content}
        </Text>
        
        {message.suggestion && !isUser && (
          <View className={`mt-2 pt-2 border-t ${
            isDark ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <Text className={`text-sm italic ${
              isDark ? 'text-indigo-300' : 'text-indigo-600'
            }`}>
              💡 {message.suggestion}
            </Text>
          </View>
        )}
        
        <Text className={`text-xs mt-1 ${
          isUser ? 'text-indigo-200' : (isDark ? 'text-gray-400' : 'text-gray-500')
        } self-end`}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </Animated.View>
  );
};

// Typing indicator component
const TypingIndicator = ({ isDark }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View className={`mb-4 items-start`}>
      <View className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isDark ? 'bg-gray-700' : 'bg-white'
      } shadow-sm`}>
        <View className="flex-row items-center">
          <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            AI is thinking{dots}
          </Text>
          <View className="flex-row ml-2">
            <View className={`w-2 h-2 rounded-full mx-0.5 ${
              isDark ? 'bg-gray-400' : 'bg-gray-500'
            }`} />
            <View className={`w-2 h-2 rounded-full mx-0.5 ${
              isDark ? 'bg-gray-400' : 'bg-gray-500'
            }`} />
            <View className={`w-2 h-2 rounded-full mx-0.5 ${
              isDark ? 'bg-gray-400' : 'bg-gray-500'
            }`} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default function ChatScreen({ route, navigation }) {
  const { chatId } = route.params;
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const { user } = useSelector((state) => state.auth);
  const { isDark } = useSelector((state) => state.theme);
  
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      loadChat();
      setupRealtimeListeners();
    }

    return () => {
      cleanup();
    };
  }, [chatId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const setupRealtimeListeners = () => {
    realtimeService.connect();
    realtimeService.startChatPolling(chatId);
    
    realtimeService.on('message_received', handleMessageReceived);
    realtimeService.on('chat_updated', handleChatUpdated);
    realtimeService.on('ai_typing', handleAiTyping);
    realtimeService.on('connected', () => setIsConnected(true));
    realtimeService.on('disconnected', () => setIsConnected(false));
  };

  const cleanup = () => {
    realtimeService.stopChatPolling(chatId);
    realtimeService.off('message_received', handleMessageReceived);
    realtimeService.off('chat_updated', handleChatUpdated);
    realtimeService.off('ai_typing', handleAiTyping);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleMessageReceived = (data) => {
    if (data.chatId === chatId) {
      const formattedMessage = {
        id: data.message._id || Date.now().toString(),
        content: data.message.content,
        sender: data.message.role === 'user' ? 'user' : 'ai',
        timestamp: data.message.timestamp || new Date().toISOString(),
        suggestion: data.message.suggestion,
      };

      setMessages(prev => {
        const exists = prev.some(msg => msg.id === formattedMessage.id);
        if (exists) return prev;
        return [...prev, formattedMessage];
      });
    }
  };

  const handleChatUpdated = (data) => {
    if (data.chat && data.chat._id === chatId) {
      const formattedMessages = data.chat.messages?.map(msg => ({
        id: msg._id,
        content: msg.content,
        sender: msg.role === 'user' ? 'user' : 'ai',
        timestamp: msg.timestamp,
        suggestion: msg.suggestion,
      })) || [];
      
      setMessages(formattedMessages);
      setChat(data.chat);
    }
  };

  const handleAiTyping = (data) => {
    if (data.chatId === chatId) {
      setAiTyping(data.isTyping);
    }
  };

  const loadChat = async () => {
    try {
      const response = await apiService.getChat(chatId);
      if (response.success) {
        const chatData = response.data;
        setChat(chatData);
        
        const formattedMessages = chatData.messages?.map(msg => ({
          id: msg._id,
          content: msg.content,
          sender: msg.role === 'user' ? 'user' : 'ai',
          timestamp: msg.timestamp,
          suggestion: msg.suggestion,
        })) || [];
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      Alert.alert('Error', 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    // Add user message optimistically
    const userMessage = {
      id: `temp-${Date.now()}`,
      content: messageText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setAiTyping(true);

    try {
      // Get user preferences for offline mode
      const useOffline = user?.preferences?.useOfflineMode || false;
      
      const response = await realtimeService.sendMessage(chatId, messageText, useOffline);
      
      if (response.success) {
        // Remove the temporary message and add the real ones
        setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
        
        const { userMessage: realUserMsg, assistantMessage, supportiveResponse } = response.data;
        
        const newMessages = [
          {
            id: realUserMsg._id,
            content: realUserMsg.content,
            sender: 'user',
            timestamp: realUserMsg.timestamp,
          },
          {
            id: assistantMessage._id,
            content: assistantMessage.content,
            sender: 'ai',
            timestamp: assistantMessage.timestamp,
            suggestion: supportiveResponse?.text,
          },
        ];

        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== userMessage.id);
          return [...filtered, ...newMessages];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setSending(false);
      setAiTyping(false);
    }
  };

  const renderMessage = ({ item }) => (
    <MessageBubble 
      message={item} 
      isUser={item.sender === 'user'} 
      isDark={isDark} 
    />
  );

  const getMessagesWithTyping = () => {
    const messageData = [...messages];
    if (aiTyping) {
      messageData.push({
        id: 'typing-indicator',
        type: 'typing',
      });
    }
    return messageData;
  };

  const renderItem = ({ item }) => {
    if (item.type === 'typing') {
      return <TypingIndicator isDark={isDark} />;
    }
    return renderMessage({ item });
  };

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <ActivityIndicator size="large" color={isDark ? '#6366F1' : '#6366F1'} />
        <Text className={`mt-4 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Loading chat...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1F2937', '#374151'] : ['#6366F1', '#8B5CF6']}
          className="px-4 pt-2 pb-4"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="mr-4 p-2"
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              
              <View className="flex-1">
                <Text className="text-white text-lg font-semibold" numberOfLines={1}>
                  {chat?.title || 'Chat'}
                </Text>
                <View className="flex-row items-center">
                  <View className={`w-2 h-2 rounded-full mr-2 ${
                    isConnected ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <Text className="text-white/80 text-sm">
                    {isConnected ? 'Connected' : 'Reconnecting...'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity className="p-2">
              <Ionicons name="ellipsis-vertical" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Messages */}
        <View className="flex-1">
          {messages.length === 0 ? (
            <View className="flex-1 justify-center items-center px-8">
              <View className={`w-20 h-20 rounded-full ${
                isDark ? 'bg-gray-800' : 'bg-indigo-50'
              } items-center justify-center mb-4`}>
                <Ionicons 
                  name="chatbubble-ellipses-outline" 
                  size={40} 
                  color={isDark ? '#6366F1' : '#6366F1'} 
                />
              </View>
              <Text className={`text-xl font-semibold mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-800'
              }`}>
                Start the conversation
              </Text>
              <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Type a message below to begin chatting with AI
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={getMessagesWithTyping()}
              renderItem={renderItem}
              keyExtractor={(item, index) => item.id || `msg-${index}`}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Input Area */}
        <View className={`border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} px-4 py-3`}>
          <View className="flex-row items-end">
            <View className={`flex-1 max-h-32 border rounded-2xl ${
              isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
            }`}>
              <TextInput
                className={`px-4 py-3 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
                placeholder="Type a message..."
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                value={inputMessage}
                onChangeText={setInputMessage}
                multiline
                returnKeyType="default"
                onSubmitEditing={sendMessage}
                editable={!sending}
              />
            </View>
            
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!inputMessage.trim() || sending}
              className="ml-3"
            >
              <LinearGradient
                colors={
                  !inputMessage.trim() || sending
                    ? (isDark ? ['#374151', '#4B5563'] : ['#D1D5DB', '#9CA3AF'])
                    : (isDark ? ['#4F46E5', '#7C3AED'] : ['#6366F1', '#8B5CF6'])
                }
                className="w-12 h-12 rounded-full items-center justify-center"
              >
                {sending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={!inputMessage.trim() || sending ? '#9CA3AF' : 'white'} 
                  />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}