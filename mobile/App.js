import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SecureStore from 'expo-secure-store';
import store from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { loginSuccess } from './src/redux/slices/authSlice';
import apiService from './src/services/api';
import "./global.css";

// Auth persistence component
function AuthPersistence() {
  const dispatch = useDispatch();
  const { isDark } = useSelector((state) => state.theme);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        // Set token in API service
        apiService.setToken(token);
        
        // You could validate the token here by making an API call
        // For now, we'll assume the token is valid if it exists
        dispatch(loginSuccess({
          token,
          user: { /* user data could be stored separately or fetched */ }
        }));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // If there's an error, remove the potentially corrupted token
      await SecureStore.deleteItemAsync('authToken');
    }
  };

  return (
    <>
      <StatusBar 
        style={isDark ? "light" : "dark"} 
        backgroundColor={isDark ? "#111827" : "#ffffff"}
      />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthPersistence />
      </GestureHandlerRootView>
    </Provider>
  );
}