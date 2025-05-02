import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native';
import * as SecureStore from 'expo-secure-store';


import { ChatContext } from '../contexts/ChatContext';
import { AuthContext } from '../contexts/AuthContext';

export default function HomeScreen() {
  // Safe context usage with defaults
  const auth = useContext(AuthContext) || {};
  const chat = useContext(ChatContext);
  
  const user = auth.user || {};
  const { 
    chats = [], 
    createChat = async () => null, 
    loadChats = async () => {}, 
    loading = false,
    error = null
  } = chat;
  
  const isModelDownloaded = chat.isModelDownloaded || false;
  const router = useRouter();
  const [localLoading, setLocalLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Safe effect with cleanup
  useEffect(() => {
    let mounted = true;
    
    const fetchChats = async () => {
      try {
        if (mounted && typeof loadChats === 'function') {
          await loadChats();
        }
      } catch (err) {
        console.error("Failed to load chats:", err);
      }
    };
    
    fetchChats();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Safe navigation with delay
  const safeNavigate = (path) => {
    if (path) {
      router.push(path);
    }
  };
  
  // Safe onRefresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (typeof loadChats === 'function') {
        await loadChats();
      }
      // const token = await ;
    const token = await SecureStore.getItemAsync('authToken');
    if(!user.authenticated){
      // If user is not authenticated, navigate to login
      safeNavigate('/login');
    }
      
      if(!token){
        safeNavigate('/login');
      }
    } catch (err) {
      console.error("Failed to refresh chats:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Safe new chat handler
  const handleNewChat = async () => {
    if (localLoading) return;
    
    setLocalLoading(true);
    try {
      const newChat = await createChat();
      console.log("New chat created:", newChat);
      if (newChat && newChat._id) {
        // safeNavigate(`/chat/${newChat._id}`);
        router.push(`/chat/${newChat._id}`);
       

      }
    } catch (err) {
      console.error("Failed to create chat:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  // Safe open chat handler
  const handleOpenChat = (chatId) => {
    if (chatId) {
      // console.log("Opening chat:", chatId);
      try {
        safeNavigate(`/chat/${chatId}`);
      } catch (err) {
        console.error('Navigation failed:', err);
      }
    }
  };

  // Safely get recent chats
  const recentChats = Array.isArray(chats) 
    ? [...chats]
        .filter(chat => chat && typeof chat === 'object')
        .sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
          const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
          return dateB - dateA;
        })
        .slice(0, 5)
    : [];

  // Safely get offline mode status
  const isOfflineMode = user?.preferences?.useOfflineMode || false;

  // If error occurs in Chat Context, show error message
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center p-5">
        <Text className="text-red-500 text-lg mb-4">Something went wrong</Text>
        <Text className="text-gray-700 mb-5 text-center">{String(error)}</Text>
        <TouchableOpacity
          className="bg-indigo-600 py-3 px-6 rounded-lg"
          onPress={onRefresh}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom']}>
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View className="p-5 pt-3">
          <Text className="text-3xl font-bold text-gray-800">
            Hello, {user?.name || 'User'}
          </Text>
          <Text className="text-base text-gray-600 mt-1">
            How can I assist you today?
          </Text>
        </View>

        {/* Mode Indicator */}
        <View className="mx-5 mb-4 p-3 bg-white rounded-lg flex-row items-center">
          <View 
            className={`w-3 h-3 rounded-full mr-2 ${
              isOfflineMode ? 'bg-orange-500' : 'bg-green-500'
            }`} 
          />
          <Text className="text-gray-700">
            Currently using: <Text className="font-medium">
              {isOfflineMode ? 'Offline' : 'Online'} Mode
            </Text>
            {isOfflineMode && !isModelDownloaded ? ' (Model not downloaded)' : ''}
          </Text>
          <TouchableOpacity 
            className="ml-auto"
            onPress={() => safeNavigate('/settings/model')}
          >
            <Text className="text-indigo-600 font-medium">Change</Text>
          </TouchableOpacity>
        </View>

        {/* New Chat Button */}
        <TouchableOpacity 
          className={`flex-row items-center justify-center p-4 rounded-xl mx-5 mb-5 ${
            localLoading ? 'bg-indigo-400' : 'bg-indigo-600'
          }`}
          onPress={handleNewChat}
          disabled={localLoading}
        >
          {localLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text className="text-white text-base font-semibold ml-2">
                New Chat
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Recent Chats Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mx-5 mb-3">
            <Text className="text-lg font-semibold text-gray-800">
              Recent Chats
            </Text>
            {recentChats.length > 0 && (
              <TouchableOpacity onPress={() => safeNavigate('/chat/history')}>
                <Text className="text-indigo-600 font-medium">See All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {recentChats.length > 0 ? (
            <View className="bg-white rounded-xl mx-5 overflow-hidden">
              {recentChats.map((chat) => (
                <TouchableOpacity
                  key={chat?.id || Math.random().toString()}
                  className="flex-row items-center p-4 border-b border-gray-100"
                  onPress={() => handleOpenChat(chat?.id)}
                >
                  <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center mr-3">
                    <Ionicons name="chatbubble-outline" size={24} color="#5D5FEF" />
                  </View>
                  <View className="flex-1">
                    <Text 
                      className="text-base font-medium text-gray-800" 
                      numberOfLines={1}
                    >
                      {chat?.title || 'New Chat'}
                    </Text>
                    <Text 
                      className="text-sm text-gray-500" 
                      numberOfLines={1}
                    >
                      {chat?.lastMessage || 'No messages yet'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-xl p-5 items-center mx-5">
              <Ionicons name="chatbubble-ellipses-outline" size={48} color="#ccc" />
              <Text className="text-base font-medium text-gray-800 mt-3">
                No recent chats
              </Text>
              <Text className="text-sm text-gray-500 text-center mt-1">
                Start a new conversation to get help with anything.
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mx-5 mb-3">
            Quick Actions
          </Text>
          <View className="flex-row mx-5 gap-3">
            <TouchableOpacity 
              className="flex-1 bg-white p-4 rounded-xl"
              onPress={() => safeNavigate('/settings/model')}
            >
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mb-3">
                <Ionicons name="cloud-outline" size={24} color="#4285f4" />
              </View>
              <Text className="text-base font-medium text-gray-800">
                Switch Mode
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Toggle between online and offline
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-white p-4 rounded-xl"
              onPress={() => safeNavigate('/settings/profile')}
            >
              <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mb-3">
                <Ionicons name="person-outline" size={24} color="#f4a742" />
              </View>
              <Text className="text-base font-medium text-gray-800">
                Profile
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Update your account settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feature Highlight Section */}
        <View className="mx-5 mb-8">
          <View className="bg-indigo-50 p-5 rounded-xl">
            <Text className="text-lg font-semibold text-indigo-900 mb-2">
              Try Offline Mode
            </Text>
            <Text className="text-sm text-indigo-700 mb-3">
              Generate text without internet connection using our Llama model. 
              Perfect for when you're on the go!
            </Text>
            
            {!isModelDownloaded ? (
              <TouchableOpacity 
                className="bg-indigo-600 py-2 px-4 rounded-lg self-start"
                onPress={() => safeNavigate('/settings/model')}
              >
                <Text className="text-white font-medium">Download Model</Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#4F46E5" />
                <Text className="text-indigo-700 font-medium ml-1">
                  Model Downloaded
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}