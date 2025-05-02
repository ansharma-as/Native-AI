// app/_layout.jsx
import { Slot, Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import "../app/globals.css";


export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <ChatProvider>
          <Slot />
        </ChatProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}