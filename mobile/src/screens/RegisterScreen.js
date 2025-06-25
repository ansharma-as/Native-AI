import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import apiService from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const { isDark } = useSelector((state) => state.theme);

  const validateForm = () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (username.trim().length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    dispatch(loginStart());

    try {
      const response = await apiService.register(
        username.trim(),
        email.trim(),
        password
      );
      
      if (response.success) {
        dispatch(loginSuccess({
          user: response.data.user,
          token: response.token
        }));
        Alert.alert('Success', 'Account created successfully!');
      } else {
        dispatch(loginFailure(response.message || 'Registration failed'));
        Alert.alert('Registration Failed', response.message || 'Unable to create account');
      }
    } catch (error) {
      dispatch(loginFailure(error.message));
      Alert.alert('Error', error.message || 'Network error occurred');
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={isDark ? ['#1F2937', '#374151'] : ['#8B5CF6', '#EC4899']}
            className="pt-20 pb-16 px-8"
          >
            <View className="items-center">
              <View className={`w-20 h-20 rounded-full ${isDark ? 'bg-purple-500' : 'bg-white'} items-center justify-center mb-6`}>
                <Ionicons 
                  name="person-add" 
                  size={40} 
                  color={isDark ? '#ffffff' : '#8B5CF6'} 
                />
              </View>
              <Text className="text-white text-3xl font-bold mb-2">Join Us</Text>
              <Text className="text-white/80 text-lg text-center">
                Create your account to start chatting with AI
              </Text>
            </View>
          </LinearGradient>

          {/* Register Form */}
          <View className="flex-1 px-8 -mt-8">
            <View className={`rounded-3xl p-8 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Username Input */}
              <View className="mb-4">
                <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Username
                </Text>
                <View className={`flex-row items-center border rounded-xl px-4 py-4 ${
                  isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                }`}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={isDark ? '#9CA3AF' : '#6B7280'} 
                  />
                  <TextInput
                    className={`flex-1 ml-3 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
                    placeholder="Choose a username"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View className="mb-4">
                <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </Text>
                <View className={`flex-row items-center border rounded-xl px-4 py-4 ${
                  isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                }`}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={isDark ? '#9CA3AF' : '#6B7280'} 
                  />
                  <TextInput
                    className={`flex-1 ml-3 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
                    placeholder="Enter your email"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </Text>
                <View className={`flex-row items-center border rounded-xl px-4 py-4 ${
                  isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                }`}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={isDark ? '#9CA3AF' : '#6B7280'} 
                  />
                  <TextInput
                    className={`flex-1 ml-3 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
                    placeholder="Create a password"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="ml-2"
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={isDark ? '#9CA3AF' : '#6B7280'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View className="mb-8">
                <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm Password
                </Text>
                <View className={`flex-row items-center border rounded-xl px-4 py-4 ${
                  isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                }`}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={isDark ? '#9CA3AF' : '#6B7280'} 
                  />
                  <TextInput
                    className={`flex-1 ml-3 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
                    placeholder="Confirm your password"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="ml-2"
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={isDark ? '#9CA3AF' : '#6B7280'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
                disabled={isLoading}
                className="mb-6"
              >
                <LinearGradient
                  colors={isDark ? ['#7C3AED', '#EC4899'] : ['#8B5CF6', '#EC4899']}
                  className="rounded-xl py-4 items-center justify-center"
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white text-lg font-semibold">Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Login Link */}
              <View className="flex-row justify-center items-center">
                <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={navigateToLogin}>
                  <Text className="text-purple-600 text-base font-semibold">Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View className="px-8 py-6">
            <Text className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}