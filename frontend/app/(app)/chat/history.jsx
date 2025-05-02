// app/(app)/chat/history.jsx
import React, { useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChatContext } from '../../../contexts/ChatContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatHistory() {
  const { chats, loadChats, deleteChat, loading, createChat } = useContext(ChatContext);
  const router = useRouter();

  useEffect(() => {
    loadChats();
  }, []);

  const handleChatPress = (chatId) => {
    router.push(`/chat/${chatId}`);
  };

  const handleDeleteChat = (chatId) => {
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteChat(chatId)
        }
      ]
    );
  };

  const renderChatItem = ({ item }) => {
    const date = new Date(item.updatedAt);
    const formattedDate = date.toLocaleDateString();
    
    return (
      <TouchableOpacity
        className="bg-white rounded-xl mb-3 shadow-sm"
        onPress={() => handleChatPress(item.id)}
      >
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-medium text-gray-800 flex-1 mr-2" numberOfLines={1}>
              {item.title || 'New Chat'}
            </Text>
            <TouchableOpacity
              onPress={() => handleDeleteChat(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color="#ff3b30" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
            {item.lastMessage || 'No messages yet'}
          </Text>
          
          <Text className="text-xs text-gray-500">{formattedDate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleNewChat = async () => {
    const newChat = await createChat();
    if (newChat) {
      router.push(`/chat/${newChat.id}`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom']}>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5D5FEF" />
        </View>
      ) : (
        <>
          <FlatList
            data={chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))}
            keyExtractor={(item) => item.id}
            renderItem={renderChatItem}
            contentContainerClassName="p-4"
            ListEmptyComponent={
              <View className="items-center justify-center py-8 mt-12">
                <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                <Text className="text-lg font-semibold text-gray-800 mt-4">No chats yet</Text>
                <Text className="text-sm text-gray-500 text-center mt-2 max-w-xs">
                  Start a new conversation to get help with anything
                </Text>
              </View>
            }
          />
          
          <TouchableOpacity
            className="flex-row items-center justify-center bg-indigo-600 rounded-full py-4 px-6 absolute bottom-5 self-center"
            onPress={handleNewChat}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text className="text-white text-base font-semibold ml-2">New Chat</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}