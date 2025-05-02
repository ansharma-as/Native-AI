// app/(app)/settings/profile.jsx
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../../contexts/AuthContext';
import api from '../../../services/api';

export default function ProfileScreen() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const router = useRouter();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Update user profile
  const handleUpdateProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Validate inputs
    if (!name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    
    try {
      // Update profile using API
      await api.put('/api/auth/profile', { name });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      setLoading(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }
    
    try {
      // Change password using API
      await api.put('/api/auth/password', {
        currentPassword,
        newPassword
      });
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setSuccess('Password changed successfully');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1">
          <View className="p-5">
            <Text className="text-2xl font-bold text-gray-800 mb-2">Profile Settings</Text>
            <Text className="text-base text-gray-600">
              Update your account information
            </Text>
          </View>

          {error && (
            <View className="mx-5 p-4 mb-5 bg-red-50 rounded-lg">
              <Text className="text-red-500">{error}</Text>
            </View>
          )}
          
          {success && (
            <View className="mx-5 p-4 mb-5 bg-green-50 rounded-lg">
              <Text className="text-green-600">{success}</Text>
            </View>
          )}

          <View className="bg-white rounded-lg p-5 mx-5 mb-5">
            <Text className="text-lg font-semibold text-gray-800 mb-5">Personal Information</Text>
            
            <View className="mb-5">
              <Text className="text-base text-gray-800 mb-2">Name</Text>
              <TextInput
                className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-base"
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
              />
            </View>
            
            <View className="mb-5">
              <Text className="text-base text-gray-800 mb-2">Email</Text>
              <TextInput
                className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-base text-gray-500"
                value={email}
                editable={false}
              />
              <Text className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </Text>
            </View>
            
            <TouchableOpacity
              className="bg-indigo-600 rounded-lg p-4 items-center mt-2"
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white text-base font-semibold">Update Profile</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-lg p-5 mx-5 mb-5">
            <Text className="text-lg font-semibold text-gray-800 mb-5">Change Password</Text>
            
            <View className="mb-5">
              <Text className="text-base text-gray-800 mb-2">Current Password</Text>
              <TextInput
                className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-base"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                secureTextEntry
              />
            </View>
            
            <View className="mb-5">
              <Text className="text-base text-gray-800 mb-2">New Password</Text>
              <TextInput
                className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-base"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry
              />
            </View>
            
            <View className="mb-5">
              <Text className="text-base text-gray-800 mb-2">Confirm New Password</Text>
              <TextInput
                className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-base"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity
              className="bg-indigo-600 rounded-lg p-4 items-center mt-2"
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white text-base font-semibold">Change Password</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}