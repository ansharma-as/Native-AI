import { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on startup
  useEffect(() => {
    async function loadToken() {
      try {
        const storedToken = await SecureStore.getItemAsync('authToken');
        
        if (storedToken) {
          setToken(storedToken);
          api.setAuthToken(storedToken);
          
          // Get user profile
          const userData = await api.get('/api/auth/me');
          setUser(userData);
        }
      } catch (err) {
        console.error('Failed to load auth state:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadToken();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response;
      
      // Save token to secure storage
      await SecureStore.setItemAsync('authToken', newToken);
      
      // Update context state
      setToken(newToken);
      setUser(userData);
      api.setAuthToken(newToken);
      
      // Navigate to home screen
      router.replace('/');
      
      return true;
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/auth/register', { 
        name, 
        email, 
        password,
        preferences: {
          useOfflineMode: false // Default to online mode
        }
      });
      
      const { token: newToken, user: userData } = response;
      
      // Save token
      await SecureStore.setItemAsync('authToken', newToken);
      
      // Update context state
      setToken(newToken);
      setUser(userData);
      api.setAuthToken(newToken);
      
      // Navigate to home
      router.replace('/');
      
      return true;
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      setToken(null);
      setUser(null);
      api.clearAuthToken();
      router.replace('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    setLoading(true);
    
    try {
      const updatedUser = await api.put('/api/auth/preferences', { preferences });
      setUser(updatedUser);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to update preferences');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updatePreferences,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}