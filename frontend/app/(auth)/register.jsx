// app/(auth)/register.jsx
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
import { SafeAreaView } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, error, loading, isAuthenticated } = useContext(AuthContext);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated]);

  const handleRegister = async () => {
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    await register(name, email, password);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 p-5 justify-center max-w-lg w-full self-center">
          <Text className="text-3xl font-bold text-gray-800 mb-2">Create Account</Text>
          <Text className="text-base text-gray-600 mb-8">Sign up to get started</Text>

          {error && <Text className="text-red-500 mb-5 text-center">{error}</Text>}

          <View className="mb-5">
            <Text className="text-base mb-2 text-gray-800">Name</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg p-3 text-base"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              autoCorrect={false}
            />
          </View>

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
              placeholder="Create a password"
              secureTextEntry
            />
          </View>

          <View className="mb-5">
            <Text className="text-base mb-2 text-gray-800">Confirm Password</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg p-3 text-base"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            className="bg-indigo-600 rounded-lg p-4 items-center mt-3"
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-semibold">Create Account</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-5 gap-1">
            <Text className="text-gray-600">Already have an account?</Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text className="text-indigo-600 font-bold">Log In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}