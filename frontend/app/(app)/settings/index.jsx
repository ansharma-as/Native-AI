// app/(app)/settings/index.jsx
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native';
import { AuthContext } from '../../../contexts/AuthContext';
import { ChatContext } from '../../../contexts/ChatContext';

export default function SettingsScreen() {
  const { user, logout } = useContext(AuthContext);
  const { isModelDownloaded } = useContext(ChatContext);
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: () => logout()
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom']}>
      <View className="flex-row items-center bg-white p-5">
        <View className="w-15 h-15 rounded-full bg-indigo-600 items-center justify-center">
          <Text className="text-2xl font-bold text-white">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <View className="flex-1 ml-4">
          <Text className="text-lg font-semibold text-gray-800">{user?.name || 'User'}</Text>
          <Text className="text-sm text-gray-600">{user?.email || 'No email'}</Text>
        </View>
        <TouchableOpacity 
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          onPress={() => router.push('/settings/profile')}
        >
          <Ionicons name="create-outline" size={20} color="#5D5FEF" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 mt-5">
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-800 mx-5 mb-2">General</Text>
          
          <TouchableOpacity 
            className="flex-row items-center bg-white p-4 border-b border-gray-100"
            onPress={() => router.push('/settings/profile')}
          >
            <Ionicons name="person-outline" size={24} color="#333" />
            <View className="flex-1 ml-4">
              <Text className="text-base font-medium text-gray-800">Profile</Text>
              <Text className="text-sm text-gray-600">Manage your account details</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center bg-white p-4"
            onPress={() => router.push('/settings/model')}
          >
            <Ionicons name={user?.preferences?.useOfflineMode ? "wifi-off-outline" : "cloud-outline"} size={24} color="#333" />
            <View className="flex-1 ml-4">
              <Text className="text-base font-medium text-gray-800">AI Model Settings</Text>
              <Text className="text-sm text-gray-600">
                Currently using {user?.preferences?.useOfflineMode ? 'offline' : 'online'} mode
                {user?.preferences?.useOfflineMode && !isModelDownloaded && ' (model not downloaded)'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-800 mx-5 mb-2">App</Text>
          
          <TouchableOpacity className="flex-row items-center bg-white p-4 border-b border-gray-100">
            <Ionicons name="information-circle-outline" size={24} color="#333" />
            <View className="flex-1 ml-4">
              <Text className="text-base font-medium text-gray-800">About</Text>
              <Text className="text-sm text-gray-600">App information and help</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center bg-white p-4"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#ff3b30" />
            <View className="flex-1 ml-4">
              <Text className="text-base font-medium text-red-500">Logout</Text>
              <Text className="text-sm text-gray-600">Sign out of your account</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}