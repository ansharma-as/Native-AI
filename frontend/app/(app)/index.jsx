// app/(app)/index.jsx
import React, { useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatContext } from '../../contexts/ChatContext';
import { AuthContext } from '../../contexts/AuthContext';

export default function HomeScreen() {
  const { user } = useContext(AuthContext);
  const { chats, createChat, loading } = useContext(ChatContext);
  const router = useRouter();

  const handleNewChat = async () => {
    const newChat = await createChat();
    if (newChat) {
      router.push(`/chat/${newChat.id}`);
    }
  };

  const handleOpenChat = (chatId) => {
    router.push(`/chat/${chatId}`);
  };

  // Get the most recent chats (up to 5)
  const recentChats = chats
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom']}>
      <ScrollView className="flex-1">
        <View className="p-5 pt-3">
          <Text className="text-3xl font-bold text-gray-800">Hello, {user?.name || 'User'}</Text>
          <Text className="text-base text-gray-600 mt-1">What can I help you with today?</Text>
        </View>

        <TouchableOpacity 
          className="bg-indigo-600 flex-row items-center justify-center p-4 rounded-xl mx-5 mb-5"
          onPress={handleNewChat}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text className="text-white text-base font-semibold ml-2">New Chat</Text>
        </TouchableOpacity>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mx-5 mb-3">Recent Chats</Text>
          {recentChats.length > 0 ? (
            <View className="bg-white rounded-xl mx-5 overflow-hidden">
              {recentChats.map((chat) => (
                <TouchableOpacity
                  key={chat.id}
                  className="flex-row items-center p-4 border-b border-gray-100"
                  onPress={() => handleOpenChat(chat.id)}
                >
                  <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center mr-3">
                    <Ionicons name="chatbubble-outline" size={24} color="#5D5FEF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-800" numberOfLines={1}>{chat.title}</Text>
                    <Text className="text-sm text-gray-500" numberOfLines={1}>
                      {chat.lastMessage || 'No messages yet'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-xl p-5 items-center mx-5">
              <Text className="text-base font-medium text-gray-800">No recent chats</Text>
              <Text className="text-sm text-gray-500 text-center mt-1">
                Start a new conversation to get help with anything.
              </Text>
            </View>
          )}
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mx-5 mb-3">Quick Actions</Text>
          <View className="flex-row mx-5 gap-3">
            <TouchableOpacity 
              className="flex-1 bg-white p-4 rounded-xl"
              onPress={() => router.push('/settings/model')}
            >
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mb-3">
                <Ionicons name="cloud-outline" size={24} color="#4285f4" />
              </View>
              <Text className="text-base font-medium text-gray-800">Switch Mode</Text>
              <Text className="text-sm text-gray-500 mt-1">
                Toggle between online and offline
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-white p-4 rounded-xl"
              onPress={() => router.push('/settings/profile')}
            >
              <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mb-3">
                <Ionicons name="person-outline" size={24} color="#f4a742" />
              </View>
              <Text className="text-base font-medium text-gray-800">Profile</Text>
              <Text className="text-sm text-gray-500 mt-1">
                Update your account settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}