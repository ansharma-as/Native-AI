// app/(auth)/login.jsx
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { AuthContext } from '../../contexts/AuthContext';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading, isAuthenticated } = useContext(AuthContext);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    await login(email, password);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 p-5 justify-center max-w-lg w-full self-center">
          <Text className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</Text>
          <Text className="text-base text-gray-600 mb-8">Login to your account</Text>

          {error && <Text className="text-red-500 mb-5 text-center">{error}</Text>}

          <View className="mb-5">
            <Text className="text-base mb-2 text-gray-800">Email</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg p-3 text-base"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="mb-5">
            <Text className="text-base mb-2 text-gray-800">Password</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg p-3 text-base"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            className="bg-indigo-600 rounded-lg p-4 items-center mt-3"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-semibold">Login</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-5 gap-1">
            <Text className="text-gray-600">Don't have an account?</Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text className="text-indigo-600 font-bold">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}