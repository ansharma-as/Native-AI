// // app/(app)/settings/index.jsx
// import React, { useContext } from 'react';
// import { View, Text, TouchableOpacity, Alert } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// import { SafeAreaView } from 'react-native';
// import { AuthContext } from '../../../contexts/AuthContext';
// import { ChatContext } from '../../../contexts/ChatContext';

// export default function SettingsScreen() {
//   const { user, logout } = useContext(AuthContext);
//   const { isModelDownloaded } = useContext(ChatContext);
//   const router = useRouter();

//   const handleLogout = () => {
//     Alert.alert(
//       "Logout",
//       "Are you sure you want to log out?",
//       [
//         {
//           text: "Cancel",
//           style: "cancel"
//         },
//         { 
//           text: "Logout", 
//           onPress: () => logout()
//         }
//       ]
//     );
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom']}>
//       <View className="flex-row items-center bg-white p-5">
//         <View className="w-15 h-15 rounded-full bg-indigo-600 items-center justify-center">
//           <Text className="text-2xl font-bold text-white">
//             {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
//           </Text>
//         </View>
//         <View className="flex-1 ml-4">
//           <Text className="text-lg font-semibold text-gray-800">{user?.name || 'User'}</Text>
//           <Text className="text-sm text-gray-600">{user?.email || 'No email'}</Text>
//         </View>
//         <TouchableOpacity 
//           className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
//           onPress={() => router.push('/settings/profile')}
//         >
//           <Ionicons name="create-outline" size={20} color="#5D5FEF" />
//         </TouchableOpacity>
//       </View>

//       <View className="flex-1 mt-5">
//         <View className="mb-8">
//           <Text className="text-lg font-semibold text-gray-800 mx-5 mb-2">General</Text>
          
//           <TouchableOpacity 
//             className="flex-row items-center bg-white p-4 border-b border-gray-100"
//             onPress={() => router.push('/settings/profile')}
//           >
//             <Ionicons name="person-outline" size={24} color="#333" />
//             <View className="flex-1 ml-4">
//               <Text className="text-base font-medium text-gray-800">Profile</Text>
//               <Text className="text-sm text-gray-600">Manage your account details</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#ccc" />
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             className="flex-row items-center bg-white p-4"
//             onPress={() => router.push('/settings/model')}
//           >
//             <Ionicons name={user?.preferences?.useOfflineMode ? "wifi-off-outline" : "cloud-outline"} size={24} color="#333" />
//             <View className="flex-1 ml-4">
//               <Text className="text-base font-medium text-gray-800">AI Model Settings</Text>
//               <Text className="text-sm text-gray-600">
//                 Currently using {user?.preferences?.useOfflineMode ? 'offline' : 'online'} mode
//                 {user?.preferences?.useOfflineMode && !isModelDownloaded && ' (model not downloaded)'}
//               </Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#ccc" />
//           </TouchableOpacity>
//         </View>

//         <View className="mb-8">
//           <Text className="text-lg font-semibold text-gray-800 mx-5 mb-2">App</Text>
          
//           <TouchableOpacity className="flex-row items-center bg-white p-4 border-b border-gray-100">
//             <Ionicons name="information-circle-outline" size={24} color="#333" />
//             <View className="flex-1 ml-4">
//               <Text className="text-base font-medium text-gray-800">About</Text>
//               <Text className="text-sm text-gray-600">App information and help</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#ccc" />
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             className="flex-row items-center bg-white p-4"
//             onPress={handleLogout}
//           >
//             <Ionicons name="log-out-outline" size={24} color="#ff3b30" />
//             <View className="flex-1 ml-4">
//               <Text className="text-base font-medium text-red-500">Logout</Text>
//               <Text className="text-sm text-gray-600">Sign out of your account</Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }


// app/(app)/settings/index.jsx
import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Linking,
  Animated,
  useColorScheme
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, setLightTheme, setDarkTheme, setSystemTheme } from '../../../redux/slices/themeSlice';
import { AuthContext } from '../../../contexts/AuthContext';
import * as SecureStore from 'expo-secure-store';

export default function SettingsScreen() {
  const { user, signOut } = useContext(AuthContext);
  const isDark = useSelector((state) => state.theme.isDark);
  const dispatch = useDispatch();
  const router = useRouter();
  const deviceTheme = useColorScheme();
  
  // Animation values
  const fadeAnim = React.useState(new Animated.Value(0))[0];
  const slideAnim = React.useState(new Animated.Value(30))[0];
  
  React.useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleSignOut = async () => {
    await SecureStore.deleteItemAsync('authToken');
    signOut();
    router.replace('/login');
  };

  const Section = ({ title, children }) => (
    <View className="mb-8">
      <Text className={`text-sm font-semibold mb-2 px-5 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
        {title}
      </Text>
      <View className={`rounded-xl mx-5 overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        {children}
      </View>
    </View>
  );

  const MenuItem = ({ icon, title, subtitle, rightElement, onPress, showBorder = true }) => (
    <TouchableOpacity
      className={`px-4 py-3 flex-row items-center ${showBorder ? (isDark ? 'border-b border-gray-700' : 'border-b border-gray-100') : ''}`}
      onPress={onPress}
      disabled={!onPress}
    >
      <View className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} items-center justify-center mr-3`}>
        <Ionicons name={icon} size={20} color={isDark ? '#E5E7EB' : '#4B5563'} />
      </View>
      <View className="flex-1">
        <Text className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {title}
        </Text>
        {subtitle && (
          <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || (
        onPress && <Ionicons name="chevron-forward" size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
      )}
    </TouchableOpacity>
  );

  // Theme switching options
  const themeOptions = [
    { label: 'System default', value: 'system' },
    { label: 'Light mode', value: 'light' },
    { label: 'Dark mode', value: 'dark' }
  ];

  const handleThemeChange = (value) => {
    switch (value) {
      case 'light':
        dispatch(setLightTheme());
        break;
      case 'dark':
        dispatch(setDarkTheme());
        break;
      case 'system':
        dispatch(setSystemTheme(deviceTheme));
        break;
    }
  };

  // Get current theme mode
  const getCurrentThemeMode = () => {
    // This is a simple approximation - you'd need to track which mode is active in your Redux store
    if (isDark === (deviceTheme === 'dark')) {
      return 'system';
    }
    return isDark ? 'dark' : 'light';
  };

  // Theme selection component
  const ThemeSelection = () => (
    <View className="px-4 py-3">
      <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
        Appearance
      </Text>
      <View className="mt-2 mb-1">
        {themeOptions.map((option, index) => (
          <TouchableOpacity 
            key={option.value}
            className={`flex-row items-center justify-between py-2.5 ${
              index < themeOptions.length - 1 ? 
                (isDark ? 'border-b border-gray-700' : 'border-b border-gray-100') : ''
            }`}
            onPress={() => handleThemeChange(option.value)}
          >
            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {option.label}
            </Text>
            <View className={`w-5 h-5 rounded-full ${
              getCurrentThemeMode() === option.value ?
                (isDark ? 'bg-indigo-500 border-2 border-indigo-300' : 'bg-indigo-600 border-2 border-indigo-300') :
                (isDark ? 'border-2 border-gray-600' : 'border-2 border-gray-300')
            }`} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Animated.View 
        style={{ 
          flex: 1, 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <ScrollView className="flex-1 pt-2">
          {/* User Profile Section */}
          <Section title="ACCOUNT">
            <TouchableOpacity 
              className={`px-4 py-4 flex-row items-center ${isDark ? 'border-b border-gray-700' : 'border-b border-gray-100'}`}
              onPress={() => router.push('/settings/profile')}
            >
              <View className={`w-16 h-16 rounded-full ${isDark ? 'bg-indigo-900 bg-opacity-30' : 'bg-indigo-100'} items-center justify-center mr-4`}>
                <Text className={`text-2xl font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-1`}>
                  {user?.name || 'User'}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {user?.email || 'email@example.com'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
            </TouchableOpacity>
            <MenuItem 
              icon="log-out-outline"
              title="Sign Out"
              subtitle="Log out of your account"
              onPress={handleSignOut}
              showBorder={false}
            />
          </Section>

          {/* Appearance Section */}
          <Section title="APPEARANCE">
            <ThemeSelection />
          </Section>

          {/* Chat Settings Section */}
          <Section title="CHAT SETTINGS">
            <MenuItem 
              icon="cloud-outline"
              title="Chat Mode"
              subtitle="Switch between online and offline"
              onPress={() => router.push('/settings/model')}
            />
            <MenuItem 
              icon="download-outline"
              title="Model Download"
              subtitle={user?.preferences?.isModelDownloaded ? "Downloaded" : "Not downloaded"}
              onPress={() => router.push('/settings/model')}
              showBorder={false}
            />
          </Section>

          {/* About Section */}
          <Section title="ABOUT">
            <MenuItem 
              icon="information-circle-outline"
              title="About The App"
              subtitle="Version 1.0.0"
              onPress={() => {}}
            />
            <MenuItem 
              icon="shield-checkmark-outline"
              title="Privacy Policy"
              onPress={() => Linking.openURL('https://example.com/privacy')}
            />
            <MenuItem 
              icon="document-text-outline"
              title="Terms of Service"
              onPress={() => Linking.openURL('https://example.com/terms')}
              showBorder={false}
            />
          </Section>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}