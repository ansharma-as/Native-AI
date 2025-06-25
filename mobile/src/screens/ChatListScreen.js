import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import apiService from '../services/api';
import realtimeService from '../services/realtimeService';

export default function ChatListScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [filteredChats, setFilteredChats] = useState([]);

  const { user } = useSelector((state) => state.auth);
  const { isDark } = useSelector((state) => state.theme);

  useEffect(() => {
    loadChats();
    setupRealtimeListeners();

    return () => {
      realtimeService.stopChatsListPolling();
      realtimeService.off('chats_updated', handleChatsUpdated);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setSearching(true);
      searchChats(searchQuery.trim());
    } else {
      setFilteredChats(chats);
      setSearching(false);
    }
  }, [searchQuery, chats]);

  const setupRealtimeListeners = () => {
    realtimeService.on('chats_updated', handleChatsUpdated);
    realtimeService.startChatsListPolling();
  };

  const handleChatsUpdated = (updatedChats) => {
    if (updatedChats && updatedChats.data) {
      setChats(updatedChats.data);
    }
  };

  const loadChats = async () => {
    try {
      const response = await apiService.getChats();
      if (response.success) {
        setChats(response.data || []);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      Alert.alert('Error', 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  }, []);

  const searchChats = async (query) => {
    try {
      const response = await apiService.searchChats(query);
      if (response.success) {
        setFilteredChats(response.data || []);
      }
    } catch (error) {
      console.error('Error searching chats:', error);
      setFilteredChats(chats);
    } finally {
      setSearching(false);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await apiService.createChat('New Chat');
      if (response.success) {
        navigation.navigate('Chat', { chatId: response.data._id });
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('Error', 'Failed to create new chat');
    }
  };

  const deleteChat = async (chatId) => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteChat(chatId);
              setChats(chats.filter(chat => chat._id !== chatId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete chat');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Chat', { chatId: item._id })}
      className={`mx-4 mb-3 rounded-2xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
    >
      <View className="flex-row items-center">
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
          isDark ? 'bg-indigo-600' : 'bg-indigo-100'
        }`}>
          <Ionicons 
            name="chatbubble-ellipses" 
            size={20} 
            color={isDark ? '#ffffff' : '#6366F1'} 
          />
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>
              {item.title}
            </Text>
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatDate(item.updatedAt)}
            </Text>
          </View>
          
          <View className="flex-row items-center justify-between">
            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`} numberOfLines={1}>
              {item.messageCount || 0} messages
            </Text>
            <View className="flex-row items-center">
              <View className={`px-2 py-1 rounded-full ${
                item.model_type === 'offline' 
                  ? (isDark ? 'bg-amber-900' : 'bg-amber-100')
                  : (isDark ? 'bg-green-900' : 'bg-green-100')
              }`}>
                <Text className={`text-xs font-medium ${
                  item.model_type === 'offline'
                    ? (isDark ? 'text-amber-300' : 'text-amber-800')
                    : (isDark ? 'text-green-300' : 'text-green-800')
                }`}>
                  {item.model_type === 'offline' ? 'Offline' : 'Online'}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={() => deleteChat(item._id)}
                className="ml-3 p-1"
              >
                <Ionicons name="trash-outline" size={16} color={isDark ? '#EF4444' : '#DC2626'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <ActivityIndicator size="large" color={isDark ? '#6366F1' : '#6366F1'} />
        <Text className={`mt-4 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Loading chats...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? ['#1F2937', '#374151'] : ['#6366F1', '#8B5CF6']}
        className="px-6 pt-4 pb-6"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-white text-2xl font-bold">Your Chats</Text>
            <Text className="text-white/80 text-sm">
              Welcome back, {user?.username || 'User'}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="settings-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className={`flex-row items-center bg-white/10 rounded-xl px-4 py-3`}>
          <Ionicons name="search-outline" size={20} color="white" />
          <TextInput
            className="flex-1 ml-3 text-white text-base"
            placeholder="Search chats..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searching && <ActivityIndicator size="small" color="white" />}
        </View>
      </LinearGradient>

      {/* Chat List */}
      <View className="flex-1">
        {filteredChats.length === 0 ? (
          <View className="flex-1 justify-center items-center px-8">
            <View className={`w-20 h-20 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'} items-center justify-center mb-4`}>
              <Ionicons 
                name="chatbubble-ellipses-outline" 
                size={40} 
                color={isDark ? '#6366F1' : '#6B7280'} 
              />
            </View>
            <Text className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
              {searchQuery ? 'No chats found' : 'No chats yet'}
            </Text>
            <Text className={`text-center mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Start a new conversation to get chatting with AI'
              }
            </Text>
            {!searchQuery && (
              <TouchableOpacity onPress={createNewChat}>
                <LinearGradient
                  colors={isDark ? ['#4F46E5', '#7C3AED'] : ['#6366F1', '#8B5CF6']}
                  className="rounded-xl py-3 px-6"
                >
                  <Text className="text-white font-semibold">Start New Chat</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredChats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingVertical: 16 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>

      {/* Floating Action Button */}
      {filteredChats.length > 0 && (
        <TouchableOpacity
          onPress={createNewChat}
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full shadow-lg"
        >
          <LinearGradient
            colors={isDark ? ['#4F46E5', '#7C3AED'] : ['#6366F1', '#8B5CF6']}
            className="w-full h-full rounded-full items-center justify-center"
          >
            <Ionicons name="add" size={28} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}