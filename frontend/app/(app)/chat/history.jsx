// // app/(app)/chat/history.jsx
// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   FlatList, 
//   TouchableOpacity, 
//   ActivityIndicator,
//   Alert 
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { SafeAreaView } from 'react-native';
// import axios from 'axios';
// import * as SecureStore from 'expo-secure-store';

// const API_URL = 'https://3d53-103-47-74-66.ngrok-free.app/api';

// export default function ChatHistory() {
//   const [chats, setChats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const router = useRouter();

//   useEffect(() => {
//     loadChats();
//   }, []);

//   // Load all chats
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

//   // Create a new chat
//   const createChat = async () => {
//     setLoading(true);
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
//       setLoading(false);
//     }
//   };

//   // Delete a chat
//   const deleteChat = async (chatId) => {
//     setLoading(true);
//     try {
//       const token = await SecureStore.getItemAsync('authToken');
      
//       if (!token) {
//         router.replace('/login');
//         return false;
//       }
      
//       const response = await axios.delete(`${API_URL}/chats/${chatId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
      
//       console.log('Delete chat response:', response.data);
      
//       setChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
//       return true;
//     } catch (err) {
//       console.error(`Error deleting chat ${chatId}:`, err);
//       setError(err.message || 'Failed to delete chat');
//       return false;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChatPress = (chatId) => {
//     router.push(`/chat/${chatId}`);
//   };

//   const handleDeleteChat = (chatId) => {
//     Alert.alert(
//       "Delete Chat",
//       "Are you sure you want to delete this chat? This action cannot be undone.",
//       [
//         {
//           text: "Cancel",
//           style: "cancel"
//         },
//         { 
//           text: "Delete", 
//           style: "destructive",
//           onPress: () => deleteChat(chatId)
//         }
//       ]
//     );
//   };

//   const renderChatItem = ({ item }) => {
//     const date = new Date(item.updatedAt);
//     const formattedDate = date.toLocaleDateString();
    
//     return (
//       <TouchableOpacity
//         className="bg-white rounded-xl mb-3 shadow-sm"
//         onPress={() => handleChatPress(item._id)}
//       >
//         <View className="p-4">
//           <View className="flex-row justify-between items-center mb-2">
//             <Text className="text-lg font-medium text-gray-800 flex-1 mr-2" numberOfLines={1}>
//               {item.title || 'New Chat'}
//             </Text>
//             <TouchableOpacity
//               onPress={() => handleDeleteChat(item._id)}
//               hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//             >
//               <Ionicons name="trash-outline" size={20} color="#ff3b30" />
//             </TouchableOpacity>
//           </View>
          
//           <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
//             {item.lastMessage || 'No messages yet'}
//           </Text>
          
//           <Text className="text-xs text-gray-500">{formattedDate}</Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const handleNewChat = async () => {
//     const newChat = await createChat();
//     if (newChat) {
//       router.push(`/chat/${newChat._id}`);
//     }
//   };

//   if (error) {
//     return (
//       <View className="flex-1 justify-center items-center p-5">
//         <Text className="text-red-500 text-lg mb-4">Something went wrong</Text>
//         <Text className="text-gray-700 mb-5 text-center">{String(error)}</Text>
//         <TouchableOpacity
//           className="bg-indigo-600 py-3 px-6 rounded-lg"
//           onPress={loadChats}
//         >
//           <Text className="text-white font-semibold">Try Again</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-gray-100">
//       {loading ? (
//         <View className="flex-1 items-center justify-center">
//           <ActivityIndicator size="large" color="#5D5FEF" />
//         </View>
//       ) : (
//         <>
//           <FlatList
//             data={chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))}
//             keyExtractor={(item) => item._id}
//             renderItem={renderChatItem}
//             contentContainerClassName="p-4"
//             ListEmptyComponent={
//               <View className="items-center justify-center py-8 mt-12">
//                 <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
//                 <Text className="text-lg font-semibold text-gray-800 mt-4">No chats yet</Text>
//                 <Text className="text-sm text-gray-500 text-center mt-2 max-w-xs">
//                   Start a new conversation to get help with anything
//                 </Text>
//               </View>
//             }
//           />
          
//           <TouchableOpacity
//             className="flex-row items-center justify-center bg-indigo-600 rounded-full py-4 px-6 absolute bottom-5 self-center"
//             onPress={handleNewChat}
//           >
//             <Ionicons name="add" size={24} color="#fff" />
//             <Text className="text-white text-base font-semibold ml-2">New Chat</Text>
//           </TouchableOpacity>
//         </>
//       )}
//     </SafeAreaView>
//   );
// }




// app/(app)/chat/history.jsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://3d53-103-47-74-66.ngrok-free.app/api';

export default function ChatHistory() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const router = useRouter();
  const isDark = useSelector((state) => state.theme.isDark);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    loadChats();
    
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

  // Load all chats
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

  // Create a new chat
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

  // Delete a chat
  const deleteChat = async (chatId) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      
      if (!token) {
        router.replace('/login');
        return false;
      }
      
      // Optimistic UI update
      setChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
      
      const response = await axios.delete(`${API_URL}/chats/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return true;
    } catch (err) {
      console.error(`Error deleting chat ${chatId}:`, err);
      // Revert the optimistic update
      loadChats();
      Alert.alert("Error", "Failed to delete chat. Please try again.");
      return false;
    }
  };

  const handleChatPress = (chatId) => {
    router.push(`/chat/${chatId}`);
  };

  const handleDeleteChat = (chatId, chatTitle) => {
    Alert.alert(
      "Delete Chat",
      `Are you sure you want to delete "${chatTitle || 'this chat'}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteChat(chatId)
        }
      ]
    );
  };

  const formatChatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // Check if today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Check if within the last 7 days
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    
    if (date > oneWeekAgo) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show the date
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  const renderChatItem = ({ item, index }) => {
    // Calculate animation delay based on index
    const animationDelay = index * 50;
    
    const itemFadeAnim = useState(new Animated.Value(0))[0];
    const itemSlideAnim = useState(new Animated.Value(20))[0];
    
    useEffect(() => {
      // Start with a delay based on index
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(itemFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(itemSlideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      }, animationDelay);
    }, []);
    
    return (
      <Animated.View style={{
        opacity: itemFadeAnim,
        transform: [{ translateY: itemSlideAnim }]
      }}>
        <TouchableOpacity
          className={`mx-5 mb-3 rounded-xl shadow-sm overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          onPress={() => handleChatPress(item._id)}
          activeOpacity={0.7}
        >
          <View className="p-4">
            <View className="flex-row justify-between items-center mb-1">
              <View className="flex-row items-center flex-1">
                <LinearGradient
                  colors={isDark ? ['#6366F1', '#4F46E5'] : ['#818CF8', '#6366F1']}
                  className="w-9 h-9 rounded-full items-center justify-center mr-3"
                >
                  <Ionicons name="chatbubble" size={16} color="#fff" />
                </LinearGradient>
                <Text className={`text-base font-semibold flex-1 ${isDark ? 'text-white' : 'text-gray-800'}`} numberOfLines={1}>
                  {item.title || 'New Chat'}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mr-3`}>
                  {formatChatDate(item.updatedAt)}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeleteChat(item._id, item.title)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons 
                    name="trash-outline" 
                    size={18} 
                    color={isDark ? '#F87171' : '#EF4444'} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <View className="ml-12">
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`} numberOfLines={2}>
                {item.lastMessage || 'No messages yet'}
              </Text>
            </View>
            
            {/* Messages count badge */}
            {item.messageCount > 0 && (
              <View className={`absolute bottom-3 right-3 px-2 py-0.5 rounded-full ${
                isDark ? 'bg-indigo-900 bg-opacity-50' : 'bg-indigo-100'
              }`}>
                <Text className={`text-xs ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
                  {item.messageCount} messages
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleNewChat = async () => {
    if (localLoading) return;
    
    const newChat = await createChat();
    if (newChat) {
      router.push(`/chat/${newChat._id}`);
    }
  };

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
            onPress={loadChats}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Animated.View 
        style={{ 
          flex: 1, 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        {/* Custom header */}
        <View className={`px-4 py-3 mb-2 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mr-3"
            >
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={isDark ? '#E5E7EB' : '#4B5563'} 
              />
            </TouchableOpacity>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Chat History
            </Text>
          </View>
        </View>
        
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={isDark ? '#818CF8' : '#6366F1'} />
          </View>
        ) : (
          <>
            <FlatList
              data={chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))}
              keyExtractor={(item) => item._id}
              renderItem={renderChatItem}
              contentContainerClassName="pt-2 pb-24"
              ListEmptyComponent={
                <View className="items-center justify-center py-8 mt-12">
                  <View className={`w-20 h-20 rounded-full ${isDark ? 'bg-gray-800' : 'bg-indigo-50'} items-center justify-center mb-4`}>
                    <Ionicons 
                      name="chatbubbles-outline" 
                      size={40} 
                      color={isDark ? '#818CF8' : '#6366F1'} 
                    />
                  </View>
                  <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>
                    No chats yet
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} text-center max-w-xs`}>
                    Start a new conversation to get help with anything
                  </Text>
                </View>
              }
            />
            
            <View 
              className="absolute w-full bottom-5 items-center"
              style={{ elevation: 5 }}
            >
              <TouchableOpacity
                className={`flex-row items-center justify-center ${
                  isDark ? 'bg-indigo-500' : 'bg-indigo-600'
                } rounded-full py-3 px-6 shadow-lg`}
                onPress={handleNewChat}
                disabled={localLoading}
              >
                {localLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="add" size={24} color="#fff" />
                    <Text className="text-white text-base font-semibold ml-2">
                      New Chat
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}