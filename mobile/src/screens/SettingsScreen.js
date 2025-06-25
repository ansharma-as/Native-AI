import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../redux/slices/themeSlice';
import { logout } from '../redux/slices/authSlice';
import apiService from '../services/api';

export default function SettingsScreen({ navigation }) {
  const [modelDownloading, setModelDownloading] = useState(false);
  const [modelStatus, setModelStatus] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isDark } = useSelector((state) => state.theme);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await apiService.logout();
            dispatch(logout());
          },
        },
      ]
    );
  };

  const checkModelStatus = async () => {
    try {
      const response = await apiService.checkModelStatus();
      setModelStatus(response);
    } catch (error) {
      console.error('Error checking model status:', error);
    }
  };

  const downloadOfflineModel = async () => {
    Alert.alert(
      'Download Offline Model',
      'This will download a large AI model for offline use. Make sure you have a stable internet connection and sufficient storage space.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: async () => {
            setModelDownloading(true);
            try {
              await apiService.downloadModel();
              Alert.alert('Success', 'Model download started. You will be notified when it completes.');
            } catch (error) {
              Alert.alert('Error', 'Failed to start model download');
            } finally {
              setModelDownloading(false);
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, description, rightComponent, onPress, danger = false }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center p-4 mx-4 mb-3 rounded-xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-sm`}
    >
      <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
        danger 
          ? (isDark ? 'bg-red-900' : 'bg-red-50')
          : (isDark ? 'bg-indigo-900' : 'bg-indigo-50')
      }`}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={danger ? (isDark ? '#EF4444' : '#DC2626') : (isDark ? '#6366F1' : '#6366F1')} 
        />
      </View>
      
      <View className="flex-1">
        <Text className={`font-semibold text-base ${
          danger 
            ? (isDark ? 'text-red-400' : 'text-red-600')
            : (isDark ? 'text-white' : 'text-gray-900')
        }`}>
          {title}
        </Text>
        {description && (
          <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </Text>
        )}
      </View>
      
      {rightComponent || (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={isDark ? '#9CA3AF' : '#6B7280'} 
        />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text className={`text-lg font-semibold mb-3 mx-4 ${
      isDark ? 'text-gray-300' : 'text-gray-800'
    }`}>
      {title}
    </Text>
  );

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? ['#1F2937', '#374151'] : ['#6366F1', '#8B5CF6']}
        className="px-4 pt-2 pb-6"
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4 p-2"
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">Settings</Text>
            <Text className="text-white/80 text-sm">
              Customize your AI chat experience
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View className="mt-6">
          <SectionHeader title="Account" />
          
          <View className={`mx-4 mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <View className="flex-row items-center">
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                isDark ? 'bg-indigo-600' : 'bg-indigo-100'
              }`}>
                <Ionicons 
                  name="person" 
                  size={24} 
                  color={isDark ? '#ffffff' : '#6366F1'} 
                />
              </View>
              
              <View className="flex-1">
                <Text className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {user?.username || 'User'}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user?.email || 'user@example.com'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View className="mb-6">
          <SectionHeader title="Appearance" />
          
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            description="Switch between light and dark themes"
            rightComponent={
              <Switch
                value={isDark}
                onValueChange={handleThemeToggle}
                trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
                thumbColor={isDark ? '#ffffff' : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* AI Settings Section */}
        <View className="mb-6">
          <SectionHeader title="AI Settings" />
          
          <SettingItem
            icon="cloud-offline-outline"
            title="Offline Mode"
            description="Use downloaded AI model for privacy"
            rightComponent={
              <Switch
                value={offlineMode}
                onValueChange={setOfflineMode}
                trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
                thumbColor={offlineMode ? '#ffffff' : '#f4f3f4'}
              />
            }
          />
          
          <SettingItem
            icon="download-outline"
            title="Download Offline Model"
            description="Download AI model for offline usage"
            rightComponent={
              modelDownloading ? (
                <ActivityIndicator size="small" color={isDark ? '#6366F1' : '#6366F1'} />
              ) : null
            }
            onPress={downloadOfflineModel}
          />
          
          <SettingItem
            icon="information-circle-outline"
            title="Model Status"
            description="Check offline model download status"
            onPress={checkModelStatus}
          />
        </View>

        {/* Support Section */}
        <View className="mb-6">
          <SectionHeader title="Support" />
          
          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            description="Get help and contact support"
            onPress={() => Alert.alert('Help', 'Help documentation coming soon!')}
          />
          
          <SettingItem
            icon="document-text-outline"
            title="Privacy Policy"
            description="Read our privacy policy"
            onPress={() => Alert.alert('Privacy', 'Privacy policy coming soon!')}
          />
          
          <SettingItem
            icon="shield-checkmark-outline"
            title="Terms of Service"
            description="View terms and conditions"
            onPress={() => Alert.alert('Terms', 'Terms of service coming soon!')}
          />
        </View>

        {/* Account Actions */}
        <View className="mb-8">
          <SectionHeader title="Account Actions" />
          
          <SettingItem
            icon="log-out-outline"
            title="Sign Out"
            description="Sign out of your account"
            onPress={handleLogout}
            danger={true}
          />
        </View>

        {/* App Info */}
        <View className="items-center pb-8">
          <Text className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            AI Chat App v1.0.0
          </Text>
          <Text className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            Made with ❤️ using React Native
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}