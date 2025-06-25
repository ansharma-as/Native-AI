// // app/(app)/index.jsx// app/(app)/index.jsx
// import React, { useContext, useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { SafeAreaView } from 'react-native';
// import { AuthContext } from '../../contexts/AuthContext';
// import axios from 'axios';
// import * as SecureStore from 'expo-secure-store';

// const API_URL = 'https://3d53-103-47-74-66.ngrok-free.app/api';

// export default function HomeScreen() {
//   const { user } = useContext(AuthContext);
//   const router = useRouter();
  
//   // Local state
//   const [chats, setChats] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [localLoading, setLocalLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [isModelDownloaded, setIsModelDownloaded] = useState(false);

//   // Load chats on component mount
//   useEffect(() => {
//     loadChats();
//     checkOfflineModelStatus();
//   }, []);

//   // Function to load all chats
//   const loadChats = async () => {
//     setLoading(true);
//     try {
//       const token = await SecureStore.getItemAsync('authToken');
      
//       if (!token) {
//         router.replace('/login');
//         return;
//       }
      
//       const response = await axios.get(`${API_URL}/chats`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
      
//       console.log('API response structure:', {
//         success: response.data.success,
//         count: response.data.count
//       });
      
//       // Access the nested data array from the response
//       const chatArray = response.data.data || [];
//       console.log(`Found ${chatArray.length} chats`);
      
//       setChats(chatArray);
//     } catch (err) {
//       console.error('Error fetching chats:', err);
//       setError(err.message || 'Failed to load chats');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to create a new chat
//   const createChat = async () => {
//     setLocalLoading(true);
//     try {
//       const token = await SecureStore.getItemAsync('authToken');
      
//       if (!token) {
//         router.replace('/login');
//         return null;
//       }
      
//       const response = await axios.post(`${API_URL}/chats`, 
//         { title: 'New Chat' },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
      
//       // Handle the response - check if nested in a data property
//       const newChat = response.data.data || response.data;
//       console.log('New chat created:', newChat);
      
//       setChats(prevChats => [...prevChats, newChat]);
//       return newChat;
//     } catch (err) {
//       console.error('Error creating chat:', err);
//       setError(err.message || 'Failed to create chat');
//       return null;
//     } finally {
//       setLocalLoading(false);
//     }
//   };

//   // Function to check offline model status
//   const checkOfflineModelStatus = async () => {
//     try {
//       const token = await SecureStore.getItemAsync('authToken');
      
//       if (!token) return { isDownloaded: false };
      
//       const response = await axios.get(`${API_URL}/chats/model/status`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
      
//       // Handle both nested and direct response formats
//       const status = response.data.data || response.data;
//       setIsModelDownloaded(status.isDownloaded || false);
//       return status;
//     } catch (err) {
//       console.error('Failed to check model status:', err);
//       return { isDownloaded: false };
//     }
//   };

//   // Handle refresh
//   const onRefresh = async () => {
//     setRefreshing(true);
//     try {
//       const token = await SecureStore.getItemAsync('authToken');
//       if (!token) {
//         router.replace('/login');
//         return;
//       }
//       await loadChats();
//     } catch (err) {
//       console.error("Failed to refresh chats:", err);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   // Handle new chat creation
//   const handleNewChat = async () => {
//     if (localLoading) return;
    
//     try {
//       const newChat = await createChat();
//       if (newChat && newChat._id) {
//         router.push(`/chat/${newChat._id}`);
//       }
//     } catch (err) {
//       console.error("Failed to create chat:", err);
//     }
//   };

//   // Handle opening a chat
//   const handleOpenChat = (chatId) => {
//     if (chatId) {
//       router.push(`/chat/${chatId}`);
//     }
//   };

//   // Get recent chats (up to 5)
//   const recentChats = Array.isArray(chats) 
//     ? [...chats]
//         .filter(chat => chat && typeof chat === 'object')
//         .sort((a, b) => {
//           const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
//           const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
//           return dateB - dateA;
//         })
//         .slice(0, 5)
//     : [];
  
//   console.log(`Filtered down to ${recentChats.length} recent chats`);

//   // Get offline mode status
//   const isOfflineMode = user?.preferences?.useOfflineMode || false;

//   // If error occurs, show error message
//   if (error) {
//     return (
//       <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center p-5">
//         <Text className="text-red-500 text-lg mb-4">Something went wrong</Text>
//         <Text className="text-gray-700 mb-5 text-center">{String(error)}</Text>
//         <TouchableOpacity
//           className="bg-indigo-600 py-3 px-6 rounded-lg"
//           onPress={onRefresh}
//         >
//           <Text className="text-white font-semibold">Try Again</Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom', "top"]}>
//       <ScrollView 
//         className="flex-1"
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         {/* Header Section */}
//         <View className="p-5 pt-3">
//           <Text className="text-3xl font-bold text-gray-800 mt-safe-or-20">
//             Hello, {user?.name || 'User'}
//           </Text>
//           <Text className="text-base text-gray-600 mt-1">
//             What can I help you with today?
//           </Text>
//         </View>

//         {/* Mode Indicator */}
//         <View className="mx-5 mb-4 p-3 bg-white rounded-lg flex-row items-center">
//           <View 
//             className={`w-3 h-3 rounded-full mr-2 ${
//               isOfflineMode ? 'bg-orange-500' : 'bg-green-500'
//             }`} 
//           />
//           <Text className="text-gray-700">
//             Currently using: <Text className="font-medium">
//               {isOfflineMode ? 'Offline' : 'Online'} Mode
//             </Text>
//             {isOfflineMode && !isModelDownloaded ? ' (Model not downloaded)' : ''}
//           </Text>
//           <TouchableOpacity 
//             className="ml-auto"
//             onPress={() => router.push('/settings/model')}
//           >
//             <Text className="text-indigo-600 font-medium">Change</Text>
//           </TouchableOpacity>
//         </View>

//         {/* New Chat Button */}
//         <TouchableOpacity 
//           className={`flex-row items-center justify-center p-4 rounded-xl mx-5 mb-5 ${
//             localLoading ? 'bg-indigo-400' : 'bg-indigo-600'
//           }`}
//           onPress={handleNewChat}
//           disabled={localLoading}
//         >
//           {localLoading ? (
//             <ActivityIndicator size="small" color="#ffffff" />
//           ) : (
//             <>
//               <Ionicons name="add-circle-outline" size={24} color="#fff" />
//               <Text className="text-white text-base font-semibold ml-2">
//                 New Chat
//               </Text>
//             </>
//           )}
//         </TouchableOpacity>

//         {/* Recent Chats Section */}
//         <View className="mb-6">
//           <View className="flex-row justify-between items-center mx-5 mb-3">
//             <Text className="text-lg font-semibold text-gray-800">
//               Recent Chats
//             </Text>
//             {recentChats.length > 0 && (
//               <TouchableOpacity onPress={() => router.push('/chat/history')}>
//                 <Text className="text-indigo-600 font-medium">See All</Text>
//               </TouchableOpacity>
//             )}
//           </View>
          
//           {/* Debug info during development */}
//           {__DEV__ && (
//             <View className="mx-5 mb-2 p-2 bg-yellow-100 rounded">
//               <Text className="text-xs">Chat count: {recentChats.length}</Text>
//             </View>
//           )}
          
//           {recentChats.length > 0 ? (
//             <View className="bg-white rounded-xl mx-5 overflow-hidden">
//               {recentChats.map((chat) => (
//                 <TouchableOpacity
//                   key={chat._id}
//                   className="flex-row items-center p-4 border-b border-gray-100"
//                   onPress={() => handleOpenChat(chat._id)}
//                 >
//                   <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center mr-3">
//                     <Ionicons name="chatbubble-outline" size={24} color="#5D5FEF" />
//                   </View>
//                   <View className="flex-1">
//                     <Text 
//                       className="text-base font-medium text-gray-800" 
//                       numberOfLines={1}
//                     >
//                       {chat.title || 'New Chat'}
//                     </Text>
//                     <Text 
//                       className="text-sm text-gray-500" 
//                       numberOfLines={1}
//                     >
//                       {chat.lastMessage || 'No messages yet'}
//                     </Text>
//                   </View>
//                   <Ionicons name="chevron-forward" size={20} color="#ccc" />
//                 </TouchableOpacity>
//               ))}
//             </View>
//           ) : (
//             <View className="bg-white rounded-xl p-5 items-center mx-5">
//               <Ionicons name="chatbubble-ellipses-outline" size={48} color="#ccc" />
//               <Text className="text-base font-medium text-gray-800 mt-3">
//                 No recent chats
//               </Text>
//               <Text className="text-sm text-gray-500 text-center mt-1">
//                 Start a new conversation to get help with anything.
//               </Text>
//             </View>
//           )}
//         </View>

//         {/* Quick Actions Section */}
//         <View className="mb-6">
//           <Text className="text-lg font-semibold text-gray-800 mx-5 mb-3">
//             Quick Actions
//           </Text>
//           <View className="flex-row mx-5 gap-3">
//             <TouchableOpacity 
//               className="flex-1 bg-white p-4 rounded-xl"
//               onPress={() => router.push('/settings/model')}
//             >
//               <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mb-3">
//                 <Ionicons name="cloud-outline" size={24} color="#4285f4" />
//               </View>
//               <Text className="text-base font-medium text-gray-800">
//                 Switch Mode
//               </Text>
//               <Text className="text-sm text-gray-500 mt-1">
//                 Toggle between online and offline
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity 
//               className="flex-1 bg-white p-4 rounded-xl"
//               onPress={() => router.push('/settings/profile')}
//             >
//               <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mb-3">
//                 <Ionicons name="person-outline" size={24} color="#f4a742" />
//               </View>
//               <Text className="text-base font-medium text-gray-800">
//                 Profile
//               </Text>
//               <Text className="text-sm text-gray-500 mt-1">
//                 Update your account settings
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Feature Highlight Section */}
//         <View className="mx-5 mb-8">
//           <View className="bg-indigo-50 p-5 rounded-xl">
//             <Text className="text-lg font-semibold text-indigo-900 mb-2">
//               Try Offline Mode
//             </Text>
//             <Text className="text-sm text-indigo-700 mb-3">
//               Generate text without internet connection using our Llama model. 
//               Perfect for when you're on the go!
//             </Text>
            
//             {!isModelDownloaded ? (
//               <TouchableOpacity 
//                 className="bg-indigo-600 py-2 px-4 rounded-lg self-start"
//                 onPress={() => router.push('/settings/model')}
//               >
//                 <Text className="text-white font-medium">Download Model</Text>
//               </TouchableOpacity>
//             ) : (
//               <View className="flex-row items-center">
//                 <Ionicons name="checkmark-circle" size={20} color="#4F46E5" />
//                 <Text className="text-indigo-700 font-medium ml-1">
//                   Model Downloaded
//                 </Text>
//               </View>
//             )}
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }







// app/(app)/index.jsx
import React, { useContext, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://3d53-103-47-74-66.ngrok-free.app/api';

export default function HomeScreen() {
  const { user } = useContext(AuthContext);
  const isDark = useSelector((state) => state.theme.isDark);
  const router = useRouter();
  
  // Animation value
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  // Local state
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isModelDownloaded, setIsModelDownloaded] = useState(false);

  // Load chats on component mount
  useEffect(() => {
    loadChats();
    checkOfflineModelStatus();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Function to load all chats
  const loadChats = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      
      if (!token) {
        router.replace('/login');
        return;
      }
      
      const response = await axios.get(`${API_URL}/chats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Access the nested data array from the response
      const chatArray = response.data.data || [];
      setChats(chatArray);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError(err.message || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new chat
  const createChat = async () => {
    setLocalLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      
      if (!token) {
        router.replace('/login');
        return null;
      }
      
      const response = await axios.post(`${API_URL}/chats`, 
        { title: 'New Chat' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Handle the response - check if nested in a data property
      const newChat = response.data.data || response.data;
      setChats(prevChats => [...prevChats, newChat]);
      return newChat;
    } catch (err) {
      console.error('Error creating chat:', err);
      setError(err.message || 'Failed to create chat');
      return null;
    } finally {
      setLocalLoading(false);
    }
  };

  // Function to check offline model status
  const checkOfflineModelStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      
      if (!token) return { isDownloaded: false };
      
      const response = await axios.get(`${API_URL}/chats/model/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Handle both nested and direct response formats
      const status = response.data.data || response.data;
      setIsModelDownloaded(status.isDownloaded || false);
      return status;
    } catch (err) {
      console.error('Failed to check model status:', err);
      return { isDownloaded: false };
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        router.replace('/login');
        return;
      }
      await loadChats();
    } catch (err) {
      console.error("Failed to refresh chats:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle new chat creation
  const handleNewChat = async () => {
    if (localLoading) return;
    
    try {
      const newChat = await createChat();
      if (newChat && newChat._id) {
        router.push(`/chat/${newChat._id}`);
      }
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  };

  // Handle opening a chat
  const handleOpenChat = (chatId) => {
    if (chatId) {
      router.push(`/chat/${chatId}`);
    }
  };

  // Get recent chats (up to 5)
  const recentChats = Array.isArray(chats) 
    ? [...chats]
        .filter(chat => chat && typeof chat === 'object')
        .sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
          const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
          return dateB - dateA;
        })
        .slice(0, 5)
    : [];

  // Get offline mode status
  const isOfflineMode = user?.preferences?.useOfflineMode || false;

  // If error occurs, show error message
  if (error) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <View className="flex-1 justify-center items-center p-5">
          <Ionicons name="alert-circle-outline" size={60} color={isDark ? '#F87171' : '#EF4444'} />
          <Text className={`text-lg font-semibold mb-4 mt-4 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
            Something went wrong
          </Text>
          <Text className={`mb-5 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {String(error)}
          </Text>
          <TouchableOpacity
            className={`py-3 px-6 rounded-lg ${isDark ? 'bg-indigo-500' : 'bg-indigo-600'}`}
            onPress={onRefresh}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getRandomGreeting = () => {
    const greetings = [
      "Hello",
      "Hi there",
      "Welcome back",
      "Good to see you",
      "Hey"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView 
          className="flex-1"
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={isDark ? '#818CF8' : '#6366F1'}
              colors={[isDark ? '#818CF8' : '#6366F1']}
            />
          }
        >
          {/* Header Section with Gradient */}
          <LinearGradient
            colors={isDark ? 
              ['#4F46E5', '#6366F1'] : 
              ['#6366F1', '#818CF8']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-6 pt-4 rounded-b-3xl"
          >
            <Text className="text-sm text-white text-opacity-80 mt-2">
              {getRandomGreeting()}
            </Text>
            <Text className="text-2xl font-bold text-white mt-1">
              {user?.name || 'User'}
            </Text>
            <Text className="text-base text-white text-opacity-90 mt-2">
              What can I help you with today?
            </Text>
          </LinearGradient>

          {/* Mode Indicator */}
          <View className={`mx-5 -mt-5 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-xl shadow-md flex-row items-center`}>
            <View className={`w-10 h-10 rounded-full ${
              isOfflineMode ? 
                (isDark ? 'bg-orange-800 bg-opacity-20' : 'bg-orange-100') : 
                (isDark ? 'bg-green-800 bg-opacity-20' : 'bg-green-100')
              } items-center justify-center mr-3`}
            >
              <Ionicons 
                name={isOfflineMode ? "cloud-offline" : "cloud-done"} 
                size={20} 
                color={isOfflineMode ? 
                  (isDark ? '#FB923C' : '#F97316') : 
                  (isDark ? '#34D399' : '#10B981')} 
              />
            </View>
            <View className="flex-1">
              <Text className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-0.5`}>
                {isOfflineMode ? 'Offline Mode' : 'Online Mode'}
              </Text>
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {isOfflineMode && !isModelDownloaded ? 'Model not downloaded' : 'Ready to chat'}
              </Text>
            </View>
            <TouchableOpacity 
              className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} py-2 px-3 rounded-lg`}
              onPress={() => router.push('/settings/model')}
            >
              <Text className={`${isDark ? 'text-indigo-300' : 'text-indigo-600'} font-medium`}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* New Chat Button */}
          <TouchableOpacity 
            className={`flex-row items-center justify-center p-4 rounded-xl mx-5 mt-5 mb-3 shadow-sm ${
              localLoading ? 
                (isDark ? 'bg-indigo-600 bg-opacity-50' : 'bg-indigo-400') : 
                (isDark ? 'bg-indigo-600' : 'bg-indigo-600')
            }`}
            onPress={handleNewChat}
            disabled={localLoading}
          >
            {localLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="add-circle" size={24} color="#fff" />
                <Text className="text-white text-base font-semibold ml-2">
                  Start New Chat
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Recent Chats Section */}
          <View className="mb-6 mt-2">
            <View className="flex-row justify-between items-center mx-5 mb-2">
              <Text className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                Recent Chats
              </Text>
              {recentChats.length > 0 && (
                <TouchableOpacity onPress={() => router.push('/chat/history')}>
                  <Text className={`${isDark ? 'text-indigo-300' : 'text-indigo-600'} font-medium`}>See All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {recentChats.length > 0 ? (
              <View>
                {recentChats.map((chat) => {
                  // Format date
                  const date = new Date(chat.updatedAt);
                  const now = new Date();
                  let timeString;
                  
                  if (date.toDateString() === now.toDateString()) {
                    // Today: show time
                    timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  } else if (date.getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000) {
                    // Within last week: show day name
                    timeString = date.toLocaleDateString([], { weekday: 'short' });
                  } else {
                    // Older: show date
                    timeString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                  }
                  
                  return (
                    <TouchableOpacity
                      key={chat._id}
                      className={`mx-5 mb-3 p-4 rounded-xl shadow-sm flex-row items-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                      onPress={() => handleOpenChat(chat._id)}
                    >
                      <LinearGradient
                        colors={isDark ? ['#6366F1', '#4F46E5'] : ['#818CF8', '#6366F1']}
                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      >
                        <Ionicons name="chatbubble" size={22} color="#fff" />
                      </LinearGradient>
                      <View className="flex-1">
                        <Text 
                          className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-1`} 
                          numberOfLines={1}
                        >
                          {chat.title || 'New Chat'}
                        </Text>
                        <Text 
                          className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} 
                          numberOfLines={1}
                        >
                          {chat.lastMessage || 'No messages yet'}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-1`}>
                          {timeString}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View className={`mx-5 p-5 rounded-xl items-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <View className={`w-16 h-16 rounded-full ${isDark ? 'bg-gray-700' : 'bg-indigo-50'} items-center justify-center mb-4`}>
                  <Ionicons 
                    name="chatbubbles-outline" 
                    size={28} 
                    color={isDark ? '#818CF8' : '#6366F1'} 
                  />
                </View>
                <Text className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-2`}>
                  No chats yet
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                  Start a new conversation to get help with anything.
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions Section */}
          <View className="mb-6">
            <Text className={`text-lg font-bold mx-5 mb-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
              Quick Actions
            </Text>
            <View className="flex-row mx-5 gap-3">
              <TouchableOpacity 
                className={`flex-1 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-xl shadow-sm`}
                onPress={() => router.push('/settings/model')}
              >
                <View className={`w-12 h-12 rounded-full ${isDark ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-50'} items-center justify-center mb-3`}>
                  <Ionicons 
                    name="cloud-outline" 
                    size={24} 
                    color={isDark ? '#60A5FA' : '#3B82F6'} 
                  />
                </View>
                <Text className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-1`}>
                  Switch Mode
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Online/Offline
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className={`flex-1 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-xl shadow-sm`}
                onPress={() => router.push('/settings/profile')}
              >
                <View className={`w-12 h-12 rounded-full ${isDark ? 'bg-orange-900 bg-opacity-30' : 'bg-orange-50'} items-center justify-center mb-3`}>
                  <Ionicons 
                    name="person-outline" 
                    size={24} 
                    color={isDark ? '#FB923C' : '#F97316'} 
                  />
                </View>
                <Text className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-1`}>
                  Profile
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Your settings
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Feature Highlight Section */}
          <View className="mx-5 mb-10">
            <LinearGradient
              colors={isDark ? 
                ['rgba(79, 70, 229, 0.2)', 'rgba(99, 102, 241, 0.1)'] : 
                ['rgba(224, 231, 255, 1)', 'rgba(199, 210, 254, 0.8)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-5 rounded-xl shadow-sm"
            >
              <View className="flex-row items-center mb-3">
                <View className={`w-12 h-12 rounded-full ${isDark ? 'bg-indigo-900 bg-opacity-30' : 'bg-white bg-opacity-25'} items-center justify-center mr-3`}>
                  <Ionicons 
                    name="flash" 
                    size={24} 
                    color={isDark ? '#818CF8' : '#4F46E5'} 
                  />
                </View>
                <Text className={`text-lg font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  Try Offline Mode
                </Text>
              </View>
              
              <Text className={`text-sm mb-4 leading-5 ${isDark ? 'text-gray-300' : 'text-indigo-700'}`}>
                Generate text without internet connection using our Llama model. 
                Perfect for when you're on the go!
              </Text>
              
              {!isModelDownloaded ? (
                <TouchableOpacity 
                  className={`${isDark ? 'bg-indigo-600' : 'bg-indigo-600'} py-2.5 px-4 rounded-lg self-start flex-row items-center`}
                  onPress={() => router.push('/settings/model')}
                >
                  <Ionicons name="cloud-download-outline" size={18} color="#fff" className="mr-2" />
                  <Text className="text-white font-semibold">
                    Download Model
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="flex-row items-center">
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color={isDark ? '#818CF8' : '#4F46E5'} 
                    className="mr-2" 
                  />
                  <Text className={`font-semibold ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    Model Downloaded
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}