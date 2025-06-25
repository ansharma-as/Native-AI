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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const { isDark } = useSelector((state) => state.theme);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    dispatch(loginStart());

    try {
      const response = await apiService.login(email.trim(), password);
      
      if (response.success) {
        dispatch(loginSuccess({
          user: response.data.user,
          token: response.token
        }));
        // Navigation will be handled by App.js based on auth state
      } else {
        dispatch(loginFailure(response.message || 'Login failed'));
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (error) {
      dispatch(loginFailure(error.message));
      Alert.alert('Error', error.message || 'Network error occurred');
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
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
            colors={isDark ? ['#1F2937', '#374151'] : ['#6366F1', '#8B5CF6']}
            className="pt-20 pb-16 px-8"
          >
            <View className="items-center">
              <View className={`w-20 h-20 rounded-full ${isDark ? 'bg-indigo-500' : 'bg-white'} items-center justify-center mb-6`}>
                <Ionicons 
                  name="chatbubble-ellipses" 
                  size={40} 
                  color={isDark ? '#ffffff' : '#6366F1'} 
                />
              </View>
              <Text className="text-white text-3xl font-bold mb-2">Welcome Back</Text>
              <Text className="text-white/80 text-lg text-center">
                Sign in to continue your AI conversations
              </Text>
            </View>
          </LinearGradient>

          {/* Login Form */}
          <View className="flex-1 px-8 -mt-8">
            <View className={`rounded-3xl p-8 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Email Input */}
              <View className="mb-6">
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
              <View className="mb-8">
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
                    placeholder="Enter your password"
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

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className="mb-6"
              >
                <LinearGradient
                  colors={isDark ? ['#4F46E5', '#7C3AED'] : ['#6366F1', '#8B5CF6']}
                  className="rounded-xl py-4 items-center justify-center"
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white text-lg font-semibold">Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Register Link */}
              <View className="flex-row justify-center items-center">
                <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity onPress={navigateToRegister}>
                  <Text className="text-indigo-600 text-base font-semibold">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View className="px-8 py-8">
            <Text className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}