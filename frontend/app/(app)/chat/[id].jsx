// app/(app)/chat/[id].jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
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
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatContext } from '../../../contexts/ChatContext';
import { AuthContext } from '../../../contexts/AuthContext';

// Message bubble component
const MessageBubble = ({ message, isUser }) => {
  return (
    <View className={`rounded-2xl px-4 py-3 mb-2 max-w-4/5 ${
      isUser ? 'bg-indigo-600 self-end' : 'bg-white self-start'
    }`}>
      <Text className={`text-base leading-6 ${
        isUser ? 'text-white' : 'text-gray-800'
      }`}>
        {message.content}
      </Text>
      
      {message.suggestion && !isUser && (
        <View className="mt-2 pt-2 border-t border-gray-100/10">
          <Text className="text-sm text-indigo-500 italic">{message.suggestion}</Text>
        </View>
      )}
    </View>
  );
};

// Main Chat Screen
export default function ChatScreen() {
    console.log('Raw params:', JSON.stringify(useLocalSearchParams()));


    const params = useLocalSearchParams();
console.log('ChatScreen params:', JSON.stringify(params));
  const { id } = useLocalSearchParams();
  console.log('ChatScreen', id);
  const { user } = useContext(AuthContext);
  const { 
    loadChat, 
    currentChat, 
    sendMessage, 
    loading,
    isModelDownloaded,
  } = useContext(ChatContext);
  console.log('currentChat', currentChat);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);

  // Load chat data
  useEffect(() => {
    if (id) {
      loadChat(id);
    }
  }, [id]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    setIsSending(true);
    const messageCopy = inputMessage;
    setInputMessage('');
    
    try {
        console.log('Sending message: id :', currentChat._id , "message", messageCopy);
      await sendMessage(currentChat._id, messageCopy);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setInputMessage(messageCopy);
    } finally {
      setIsSending(false);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current && currentChat?.messages?.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [currentChat?.messages]);

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return <MessageBubble message={item} isUser={isUser} />;
  };

  // Display loading state
  if (loading && !currentChat) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#5D5FEF" />
      </View>
    );
  }

  // Get offline mode status
  const isOfflineMode = user?.preferences?.useOfflineMode || false;

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Mode indicator */}
        <View className="absolute top-3 self-center bg-indigo-600 rounded-full py-1 px-3 flex-row items-center z-10">
          <Ionicons 
            name={isOfflineMode ? "wifi-off-outline" : "cloud-outline"} 
            size={14} 
            color="#fff" 
          />
          <Text className="text-xs font-medium text-white ml-1">
            {isOfflineMode ? 'Offline Mode' : 'Online Mode'}
            {isOfflineMode && !isModelDownloaded && ' (Model not downloaded)'}
          </Text>
        </View>

        {/* Chat Messages */}
        <FlatList
          ref={flatListRef}
          data={currentChat?.messages || []}
          keyExtractor={(item, index) => item.id || `msg-${index}`}
          renderItem={renderMessage}
          contentContainerClassName="p-4 pt-14" // Add padding for the mode indicator
          ListEmptyComponent={
            <View className="items-center justify-center py-8 mt-12">
              <Text className="text-lg font-semibold text-gray-800">No messages yet</Text>
              <Text className="text-sm text-gray-500 text-center mt-2 max-w-xs">
                Start the conversation by typing a message below
              </Text>
            </View>
          }
        />

        {/* Input Area */}
        <View className="flex-row p-3 bg-white border-t border-gray-200">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-base mr-2 max-h-32"
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Type a message..."
            multiline
            returnKeyType="default"
          />
          <TouchableOpacity
            className={`w-12 h-12 rounded-full items-center justify-center ${
              !inputMessage.trim() || isSending ? 'bg-gray-400' : 'bg-indigo-600'
            }`}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}