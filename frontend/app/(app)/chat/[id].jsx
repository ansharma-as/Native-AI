// // app/(app)/chat/[id].jsx
// import React, { useState, useEffect, useContext, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { useLocalSearchParams } from 'expo-router';
// import { SafeAreaView } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { AuthContext } from '../../../contexts/AuthContext';
// import axios from 'axios';
// import * as SecureStore from 'expo-secure-store';

// const API_URL = 'https://3d53-103-47-74-66.ngrok-free.app/api';

// // Message bubble component
// const MessageBubble = ({ message, isUser }) => {
//   return (
//     <View className={`rounded-2xl px-4 py-3 mb-2 max-w-4/5 ${
//       isUser ? 'bg-indigo-600 self-end' : 'bg-white self-start'
//     }`}>
//       <Text className={`text-base leading-6 ${
//         isUser ? 'text-white' : 'text-gray-800'
//       }`}>
//         {message.content}
//       </Text>
      
//       {message.suggestion && !isUser && (
//         <View className="mt-2 pt-2 border-t border-gray-100/10">
//           <Text className="text-sm text-indigo-500 italic">{message.suggestion}</Text>
//         </View>
//       )}
//     </View>
//   );
// };

// // Main Chat Screen
// export default function ChatScreen() {
//   const params = useLocalSearchParams();
//   const chatId = params.id;
  
//   const { user } = useContext(AuthContext);
//   const [currentChat, setCurrentChat] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isSending, setIsSending] = useState(false);
//   const [isModelDownloaded, setIsModelDownloaded] = useState(false);
//   const [error, setError] = useState(null);
  
//   const flatListRef = useRef(null);

//   // Load chat data
//   useEffect(() => {
//     if (chatId) {
//       loadChat(chatId);
//       checkOfflineModelStatus();
//     }
//   }, [chatId]);

//   // Load chat function
//   const loadChat = async (id) => {
//     setLoading(true);
//     try {
//       const token = await SecureStore.getItemAsync('authToken');
      
//       if (!token) {
//         setError('Authentication required');
//         return null;
//       }
      
//       const response = await axios.get(`${API_URL}/chats/${id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
      
//       console.log('Chat response structure:', response.data);
      
//       // Handle API response structure
//       const chatData = response.data.data?.chat || response.data.data || response.data;
//       console.log('Chat data:', chatData);
      
//       // Format messages to match our UI components
//       if (chatData.messages && Array.isArray(chatData.messages)) {
//         chatData.messages = chatData.messages.map(msg => ({
//           id: msg._id,
//           content: msg.content,
//           sender: msg.role === 'user' ? 'user' : 'ai',
//           sentiment: msg.sentiment || 'neutral',
//           timestamp: msg.timestamp
//         }));
//       }
      
//       setCurrentChat(chatData);
//       return chatData;
//     } catch (err) {
//       console.error(`Error fetching chat ${id}:`, err);
//       setError(err.message || 'Failed to load chat');
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Check offline model status
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

//   // Send message function with correct API parameters
//   const sendMessage = async (id, message) => {
//     // Use offline mode based on user preference if available
//     console.log('Sending message:', message);
//     const useOfflineMode = user?.preferences?.useOfflineMode || false;
    
//     if (useOfflineMode && !isModelDownloaded) {
//       Alert.alert(
//         "Offline Model Not Downloaded",
//         "You've selected offline mode, but the model isn't downloaded yet. Would you like to download it now or continue in online mode?",
//         [
//           {
//             text: "Download Model",
//             onPress: () => downloadOfflineModel()
//           },
//           {
//             text: "Use Online Mode",
//             onPress: async () => {
//               try {
//                 console.log('Using online mode to send message');
//                 const token = await SecureStore.getItemAsync('authToken');
//                 const response = await axios.post(
//                   `${API_URL}/chats/${id}/messages`, 
//                   {
//                     message: message,
//                     useOffline: "false"  // Always string "false" when choosing online mode
//                   },
//                   {
//                     headers: {
//                       Authorization: `Bearer ${token}`,
//                       'Content-Type': 'application/json',
//                     },
//                   }
//                 );
                
//                 console.log('Send message response:', response.data);
                
//                 // Process the response and update chat
//                 processMessageResponse(id, message, response.data);
//                 return response.data;
//               } catch (err) {
//                 console.error('Failed to send message:', err);
//                 setError(err.message || 'Failed to send message');
//                 return null;
//               }
//             }
//           },
//           {
//             text: "Cancel",
//             style: "cancel"
//           }
//         ]
//       );
//       return null;
//     }
    
//     try {
//       const token = await SecureStore.getItemAsync('authToken');
//       const response = await axios.post(
//         `${API_URL}/chats/${id}/messages`, 
//         {
//           message: message,
//           useOffline: useOfflineMode ? "true" : "false" 
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
      
//       console.log('Send message response:', response.data);
      
//       // Process the response and update chat
//       processMessageResponse(id, message, response.data);
//       return response.data;
//     } catch (err) {
//       console.error('Failed to send message:', err);
//       setError(err.message || 'Failed to send message');
//       return null;
//     }
//   };

//   // Process message response based on the API structure
//   const processMessageResponse = (id, userMessage, response) => {
//     try {
//       console.log('Processing message response:', response);
      
//       // Extract the updated chat from the response
//       const chatData = response.data?.chat;
      
//       if (!chatData || !chatData.messages || !Array.isArray(chatData.messages) || chatData.messages.length < 2) {
//         console.error('Invalid response structure:', response);
        
//         // Try to recover if possible - use the entire response as chatData
//         if (response.data) {
//           // If there's any data at all, try to use it
//           const fallbackChatData = response.data;
//           if (fallbackChatData.messages && Array.isArray(fallbackChatData.messages) && fallbackChatData.messages.length >= 2) {
//             // We can recover with this data
//             updateChatWithRawMessages(id, userMessage, fallbackChatData);
//             return;
//           }
//         }
        
//         throw new Error('Invalid response from server');
//       }
      
//       // Get the last two messages (user message and AI response)
//       const messages = chatData.messages;
//       const userMsg = messages[messages.length - 2]; // Second last message should be user's
//       const aiMsg = messages[messages.length - 1];   // Last message should be AI's
      
//       // Get supportive response if available
//       const supportiveResponse = response.data?.supportiveResponse?.text;
      
//       // Update the current chat with these new messages
//       updateChatWithNewMessages(id, userMsg, aiMsg, supportiveResponse);
//     } catch (err) {
//       console.error('Error processing message response:', err);
//       // Create a simple fallback response if processing fails
//       createFallbackResponse(id, userMessage);
//     }
//   };
  
//   // Update chat with new messages from API - THIS WAS MISSING IN ORIGINAL CODE
//   const updateChatWithNewMessages = (id, userMsg, aiMsg, supportiveResponse) => {
//     setCurrentChat(prevChat => {
//       if (!prevChat) return prevChat;
      
//       // Create new message objects with our UI format
//       const newUserMessage = {
//         id: userMsg._id,
//         content: userMsg.content,
//         sender: 'user',
//         timestamp: userMsg.timestamp
//       };
      
//       const newAiMessage = {
//         id: aiMsg._id,
//         content: aiMsg.content,
//         sender: 'ai',
//         sentiment: aiMsg.sentiment || 'neutral',
//         suggestion: supportiveResponse, // Use supportive response as suggestion
//         timestamp: aiMsg.timestamp
//       };
      
//       // Update messages array
//       const updatedMessages = prevChat.messages ? [...prevChat.messages] : [];
      
//       // Check if messages already exist (avoid duplicates)
//       const userMsgExists = updatedMessages.some(msg => msg.id === userMsg._id);
//       const aiMsgExists = updatedMessages.some(msg => msg.id === aiMsg._id);
      
//       if (!userMsgExists) {
//         updatedMessages.push(newUserMessage);
//       }
      
//       if (!aiMsgExists) {
//         updatedMessages.push(newAiMessage);
//       }
      
//       // Update the chat
//       return {
//         ...prevChat,
//         messages: updatedMessages,
//         lastMessage: aiMsg.content,
//         updatedAt: new Date().toISOString()
//       };
//     });
//   };
  
//   // Add a fallback method to handle response failures
//   const createFallbackResponse = (id, userMessage) => {
//     setCurrentChat(prevChat => {
//       if (!prevChat) return prevChat;
      
//       // Create a new message for the user input
//       const newUserMessage = {
//         id: `user-${Date.now()}`,
//         content: userMessage,
//         sender: 'user',
//         timestamp: new Date().toISOString()
//       };
      
//       // Create a fallback AI response
//       const newAiMessage = {
//         id: `ai-${Date.now()}`,
//         content: "I'm sorry, there was an issue processing the response. Please try again.",
//         sender: 'ai',
//         sentiment: 'neutral',
//         timestamp: new Date().toISOString()
//       };
      
//       // Update messages array
//       const updatedMessages = prevChat.messages ? [...prevChat.messages] : [];
      
//       // Check if the user message already exists to avoid duplicates
//       const userMsgExists = updatedMessages.some(msg => 
//         msg.sender === 'user' && msg.content === userMessage
//       );
      
//       if (!userMsgExists) {
//         updatedMessages.push(newUserMessage);
//       }
      
//       updatedMessages.push(newAiMessage);
      
//       // Update the chat
//       return {
//         ...prevChat,
//         messages: updatedMessages,
//         lastMessage: newAiMessage.content,
//         updatedAt: new Date().toISOString()
//       };
//     });
//   };
  
//   // Add an alternative update method for different response structures
//   const updateChatWithRawMessages = (id, userMessage, chatData) => {
//     setCurrentChat(prevChat => {
//       if (!prevChat) return prevChat;
      
//       // Extract messages from chatData
//       const messages = chatData.messages || [];
      
//       // Map messages to our UI format
//       const formattedMessages = messages.map(msg => ({
//         id: msg._id || `msg-${Date.now()}-${Math.random()}`,
//         content: msg.content,
//         sender: msg.role === 'user' ? 'user' : 'ai',
//         sentiment: msg.sentiment || 'neutral',
//         timestamp: msg.timestamp || new Date().toISOString()
//       }));
      
//       // Update the chat
//       return {
//         ...prevChat,
//         messages: formattedMessages,
//         lastMessage: formattedMessages.length > 0 ? 
//           formattedMessages[formattedMessages.length - 1].content : 
//           prevChat.lastMessage,
//         updatedAt: new Date().toISOString()
//       };
//     });
//   };
  
//   // Download offline model
//   const downloadOfflineModel = async () => {
//     try {
//       const token = await SecureStore.getItemAsync('authToken');
      
//       const response = await axios.post(
//         `${API_URL}/chats/model/download`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
      
//       console.log('Download model response:', response.data);
      
//       // Poll for status updates
//       const statusInterval = setInterval(async () => {
//         const status = await checkOfflineModelStatus();
        
//         if (status.isDownloaded) {
//           setIsModelDownloaded(true);
//           clearInterval(statusInterval);
//           Alert.alert("Download Complete", "The offline model has been downloaded successfully.");
//         }
//       }, 2000);
      
//     } catch (err) {
//       setError(err.message || 'Failed to download offline model');
//     }
//   };

//   // Improved handleSendMessage with better error handling
//   const handleSendMessage = async () => {
//     if (!inputMessage.trim()) return;
    
//     setIsSending(true);
//     const messageCopy = inputMessage;
//     setInputMessage('');
    
//     // Immediately add user message to UI for better UX
//     setCurrentChat(prevChat => {
//       if (!prevChat) return prevChat;
      
//       const userMessage = {
//         id: `temp-user-${Date.now()}`,
//         content: messageCopy,
//         sender: 'user',
//         timestamp: new Date().toISOString()
//       };
      
//       const updatedMessages = prevChat.messages ? [...prevChat.messages] : [];
      
//       // Check if a similar message already exists
//       const messageExists = updatedMessages.some(msg => 
//         msg.sender === 'user' && msg.content === messageCopy
//       );
      
//       if (!messageExists) {
//         updatedMessages.push(userMessage);
//       }
      
//       return {
//         ...prevChat,
//         messages: updatedMessages
//       };
//     });
    
//     try {
//       await sendMessage(chatId, messageCopy);
//     } catch (error) {
//       console.error('Error sending message:', error);
//       Alert.alert('Error', 'Failed to send message. Please try again.');
      
//       // Create a fallback AI response on error
//       setCurrentChat(prevChat => {
//         if (!prevChat) return prevChat;
        
//         const errorMessage = {
//           id: `error-${Date.now()}`,
//           content: "Sorry, there was an error processing your message. Please try again.",
//           sender: 'ai',
//           sentiment: 'neutral',
//           timestamp: new Date().toISOString()
//         };
        
//         return {
//           ...prevChat,
//           messages: [...(prevChat.messages || []), errorMessage]
//         };
//       });
//     } finally {
//       setIsSending(false);
//     }
//   };

//   // Scroll to bottom when new messages arrive
//   useEffect(() => {
//     if (flatListRef.current && currentChat?.messages?.length > 0) {
//       flatListRef.current.scrollToEnd({ animated: true });
//     }
//   }, [currentChat?.messages]);

//   const renderMessage = ({ item }) => {
//     const isUser = item.sender === 'user';
//     return <MessageBubble message={item} isUser={isUser} />;
//   };

//   // Display loading state
//   if (loading && !currentChat) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <ActivityIndicator size="large" color="#5D5FEF" />
//       </View>
//     );
//   }

//   // Display error state
//   if (error) {
//     return (
//       <View className="flex-1 justify-center items-center p-5">
//         <Text className="text-red-500 text-lg mb-4">Something went wrong</Text>
//         <Text className="text-gray-700 mb-5 text-center">{String(error)}</Text>
//         <TouchableOpacity
//           className="bg-indigo-600 py-3 px-6 rounded-lg"
//           onPress={() => {
//             setError(null);
//             loadChat(chatId);
//           }}
//         >
//           <Text className="text-white font-semibold">Try Again</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   // Get offline mode status
//   const isOfflineMode = user?.preferences?.useOfflineMode || false;

//   return (
//     <SafeAreaView className="flex-1 bg-gray-100">
//       <KeyboardAvoidingView
//         className="flex-1"
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         keyboardVerticalOffset={90}
//       >
//         {/* Mode indicator */}
//         <View className="absolute top-3 self-center bg-indigo-600 rounded-full py-1 px-3 flex-row items-center z-10">
//           <Ionicons 
//             name={isOfflineMode ? "wifi-off-outline" : "cloud-outline"} 
//             size={14} 
//             color="#fff" 
//           />
//           <Text className="text-xs font-medium text-white ml-1">
//             {isOfflineMode ? 'Offline Mode' : 'Online Mode'}
//             {isOfflineMode && !isModelDownloaded && ' (Model not downloaded)'}
//           </Text>
//         </View>

//         {/* Chat Messages */}
//         <FlatList
//           ref={flatListRef}
//           data={currentChat?.messages || []}
//           keyExtractor={(item, index) => item.id || `msg-${index}`}
//           renderItem={renderMessage}
//           contentContainerClassName="p-4 pt-14" // Add padding for the mode indicator
//           ListEmptyComponent={
//             <View className="items-center justify-center py-8 mt-12">
//               <Text className="text-lg font-semibold text-gray-800">No messages yet</Text>
//               <Text className="text-sm text-gray-500 text-center mt-2 max-w-xs">
//                 Start the conversation by typing a message below
//               </Text>
//             </View>
//           }
//         />

//         {/* Input Area */}
//         <View className="flex-row p-3 bg-white border-t border-gray-200">
//           <TextInput
//             className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-base mr-2 max-h-32"
//             value={inputMessage}
//             onChangeText={setInputMessage}
//             placeholder="Type a message..."
//             multiline
//             returnKeyType="default"
//           />
//           <TouchableOpacity
//             className={`w-12 h-12 rounded-full items-center justify-center ${
//               !inputMessage.trim() || isSending ? 'bg-gray-400' : 'bg-indigo-600'
//             }`}
//             onPress={handleSendMessage}
//             disabled={!inputMessage.trim() || isSending}
//           >
//             {isSending ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <Ionicons name="send" size={20} color="#fff" />
//             )}
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }



// app/(app)/chat/[id].jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { AuthContext } from '../../../contexts/AuthContext';
import { BlurView } from 'expo-blur';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://3d53-103-47-74-66.ngrok-free.app/api';

// Message bubble component
const MessageBubble = ({ message, isUser, isDark }) => {
  return (
    <View className={`rounded-2xl px-4 py-3 mb-2 max-w-[80%] ${
      isUser ? 
        (isDark ? 'bg-indigo-600' : 'bg-indigo-600 self-end') : 
        (isDark ? 'bg-gray-800 self-start' : 'bg-white self-start')
    }`}>
      <Text className={`text-base leading-6 ${
        isUser || isDark ? 'text-white' : 'text-gray-800'
      }`}>
        {message.content}
      </Text>
      
      {message.suggestion && !isUser && (
        <View className={`mt-2 pt-2 ${isDark ? 'border-gray-700' : 'border-gray-100'} border-t`}>
          <Text className={`text-sm italic ${isDark ? 'text-indigo-300' : 'text-indigo-500'}`}>
            {message.suggestion}
          </Text>
        </View>
      )}
      
      <Text className={`text-right text-xs mt-1 ${
        isUser ? 'text-indigo-200' : (isDark ? 'text-gray-500' : 'text-gray-400')
      }`}>
        {formatMessageTime(message.timestamp)}
      </Text>
    </View>
  );
};

// Helper function to format message time
const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Main Chat Screen
export default function ChatScreen() {
  const params = useLocalSearchParams();
  const chatId = params.id;
  const router = useRouter();
  
  const { user } = useContext(AuthContext);
  const isDark = useSelector((state) => state.theme.isDark);
  
  const [currentChat, setCurrentChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isModelDownloaded, setIsModelDownloaded] = useState(false);
  const [error, setError] = useState(null);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideUpAnim = useState(new Animated.Value(50))[0];
  
  const flatListRef = useRef(null);

  // Load chat data
  useEffect(() => {
    if (chatId) {
      loadChat(chatId);
      checkOfflineModelStatus();
      
      // Animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [chatId]);

  // Load chat function
  const loadChat = async (id) => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      
      if (!token) {
        setError('Authentication required');
        return null;
      }
      
      const response = await axios.get(`${API_URL}/chats/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Handle API response structure
      const chatData = response.data.data?.chat || response.data.data || response.data;
      
      // Format messages to match our UI components
      if (chatData.messages && Array.isArray(chatData.messages)) {
        chatData.messages = chatData.messages.map(msg => ({
          id: msg._id,
          content: msg.content,
          sender: msg.role === 'user' ? 'user' : 'ai',
          sentiment: msg.sentiment || 'neutral',
          timestamp: msg.timestamp || new Date().toISOString()
        }));
      }
      
      setCurrentChat(chatData);
      return chatData;
    } catch (err) {
      console.error(`Error fetching chat ${id}:`, err);
      setError(err.message || 'Failed to load chat');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check offline model status
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

  // Send message function with correct API parameters
  const sendMessage = async (id, message) => {
    // Use offline mode based on user preference if available
    const useOfflineMode = user?.preferences?.useOfflineMode || false;
    
    if (useOfflineMode && !isModelDownloaded) {
      Alert.alert(
        "Offline Model Not Downloaded",
        "You've selected offline mode, but the model isn't downloaded yet. Would you like to download it now or continue in online mode?",
        [
          {
            text: "Download Model",
            onPress: () => downloadOfflineModel()
          },
          {
            text: "Use Online Mode",
            onPress: async () => {
              try {
                const token = await SecureStore.getItemAsync('authToken');
                const response = await axios.post(
                  `${API_URL}/chats/${id}/messages`, 
                  {
                    message: message,
                    useOffline: "false"  // Always string "false" when choosing online mode
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  }
                );
                
                // Process the response and update chat
                processMessageResponse(id, message, response.data);
                return response.data;
              } catch (err) {
                console.error('Failed to send message:', err);
                setError(err.message || 'Failed to send message');
                return null;
              }
            }
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
      return null;
    }
    
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await axios.post(
        `${API_URL}/chats/${id}/messages`, 
        {
          message: message,
          useOffline: useOfflineMode ? "true" : "false" 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Process the response and update chat
      processMessageResponse(id, message, response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
      return null;
    }
  };

  // Process message response based on the API structure
  const processMessageResponse = (id, userMessage, response) => {
    try {
      // Extract the updated chat from the response
      const chatData = response.data?.chat;
      
      if (!chatData || !chatData.messages || !Array.isArray(chatData.messages) || chatData.messages.length < 2) {
        // Try to recover if possible - use the entire response as chatData
        if (response.data) {
          // If there's any data at all, try to use it
          const fallbackChatData = response.data;
          if (fallbackChatData.messages && Array.isArray(fallbackChatData.messages) && fallbackChatData.messages.length >= 2) {
            // We can recover with this data
            updateChatWithRawMessages(id, userMessage, fallbackChatData);
            return;
          }
        }
        
         setError('Invalid response from server');
      }
      
      // Get the last two messages (user message and AI response)
      const messages = chatData.messages;
      const userMsg = messages[messages.length - 2]; // Second last message should be user's
      const aiMsg = messages[messages.length - 1];   // Last message should be AI's
      
      // Get supportive response if available
      const supportiveResponse = response.data?.supportiveResponse?.text;
      
      // Update the current chat with these new messages
      updateChatWithNewMessages(id, userMsg, aiMsg, supportiveResponse);
    } catch (err) {
      console.error('Error processing message response:', err);
      // Create a simple fallback response if processing fails
      createFallbackResponse(id, userMessage);
    }
  };
  
  // Update chat with new messages from API
  const updateChatWithNewMessages = (id, userMsg, aiMsg, supportiveResponse) => {
    setCurrentChat(prevChat => {
      if (!prevChat) return prevChat;
      
      // Create new message objects with our UI format
      const newUserMessage = {
        id: userMsg._id,
        content: userMsg.content,
        sender: 'user',
        timestamp: userMsg.timestamp || new Date().toISOString()
      };
      
      const newAiMessage = {
        id: aiMsg._id,
        content: aiMsg.content,
        sender: 'ai',
        sentiment: aiMsg.sentiment || 'neutral',
        suggestion: supportiveResponse, // Use supportive response as suggestion
        timestamp: aiMsg.timestamp || new Date().toISOString()
      };
      
      // Update messages array
      const updatedMessages = prevChat.messages ? [...prevChat.messages] : [];
      
      // Check if messages already exist (avoid duplicates)
      const userMsgExists = updatedMessages.some(msg => msg.id === userMsg._id);
      const aiMsgExists = updatedMessages.some(msg => msg.id === aiMsg._id);
      
      if (!userMsgExists) {
        updatedMessages.push(newUserMessage);
      }
      
      if (!aiMsgExists) {
        updatedMessages.push(newAiMessage);
      }
      
      // Update the chat
      return {
        ...prevChat,
        messages: updatedMessages,
        lastMessage: aiMsg.content,
        updatedAt: new Date().toISOString()
      };
    });
  };
  
  // Add a fallback method to handle response failures
  const createFallbackResponse = (id, userMessage) => {
    setCurrentChat(prevChat => {
      if (!prevChat) return prevChat;
      
      // Create a new message for the user input
      const newUserMessage = {
        id: `user-${Date.now()}`,
        content: userMessage,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      
      // Create a fallback AI response
      const newAiMessage = {
        id: `ai-${Date.now()}`,
        content: "I'm sorry, there was an issue processing the response. Please try again.",
        sender: 'ai',
        sentiment: 'neutral',
        timestamp: new Date().toISOString()
      };
      
      // Update messages array
      const updatedMessages = prevChat.messages ? [...prevChat.messages] : [];
      
      // Check if the user message already exists to avoid duplicates
      const userMsgExists = updatedMessages.some(msg => 
        msg.sender === 'user' && msg.content === userMessage
      );
      
      if (!userMsgExists) {
        updatedMessages.push(newUserMessage);
      }
      
      updatedMessages.push(newAiMessage);
      
      // Update the chat
      return {
        ...prevChat,
        messages: updatedMessages,
        lastMessage: newAiMessage.content,
        updatedAt: new Date().toISOString()
      };
    });
  };
  
  // Add an alternative update method for different response structures
  const updateChatWithRawMessages = (id, userMessage, chatData) => {
    setCurrentChat(prevChat => {
      if (!prevChat) return prevChat;
      
      // Extract messages from chatData
      const messages = chatData.messages || [];
      
      // Map messages to our UI format
      const formattedMessages = messages.map(msg => ({
        id: msg._id || `msg-${Date.now()}-${Math.random()}`,
        content: msg.content,
        sender: msg.role === 'user' ? 'user' : 'ai',
        sentiment: msg.sentiment || 'neutral',
        timestamp: msg.timestamp || new Date().toISOString()
      }));
      
      // Update the chat
      return {
        ...prevChat,
        messages: formattedMessages,
        lastMessage: formattedMessages.length > 0 ? 
          formattedMessages[formattedMessages.length - 1].content : 
          prevChat.lastMessage,
        updatedAt: new Date().toISOString()
      };
    });
  };
  
  // Download offline model
  const downloadOfflineModel = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      
      const response = await axios.post(
        `${API_URL}/chats/model/download`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Poll for status updates
      const statusInterval = setInterval(async () => {
        const status = await checkOfflineModelStatus();
        
        if (status.isDownloaded) {
          setIsModelDownloaded(true);
          clearInterval(statusInterval);
          Alert.alert("Download Complete", "The offline model has been downloaded successfully.");
        }
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to download offline model');
    }
  };

  // Improved handleSendMessage with better error handling
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    setIsSending(true);
    const messageCopy = inputMessage;
    setInputMessage('');
    
    // Immediately add user message to UI for better UX
    setCurrentChat(prevChat => {
      if (!prevChat) return prevChat;
      
      const userMessage = {
        id: `temp-user-${Date.now()}`,
        content: messageCopy,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      
      const updatedMessages = prevChat.messages ? [...prevChat.messages] : [];
      
      // Check if a similar message already exists
      const messageExists = updatedMessages.some(msg => 
        msg.sender === 'user' && msg.content === messageCopy
      );
      
      if (!messageExists) {
        updatedMessages.push(userMessage);
      }
      
      return {
        ...prevChat,
        messages: updatedMessages
      };
    });
    
    try {
      await sendMessage(chatId, messageCopy);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      
      // Create a fallback AI response on error
      setCurrentChat(prevChat => {
        if (!prevChat) return prevChat;
        
        const errorMessage = {
          id: `error-${Date.now()}`,
          content: "Sorry, there was an error processing your message. Please try again.",
          sender: 'ai',
          sentiment: 'neutral',
          timestamp: new Date().toISOString()
        };
        
        return {
          ...prevChat,
          messages: [...(prevChat.messages || []), errorMessage]
        };
      });
    } finally {
      setIsSending(false);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current && currentChat?.messages?.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [currentChat?.messages]);

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return <MessageBubble message={item} isUser={isUser} isDark={isDark} />;
  };

  // Display loading state
  if (loading && !currentChat) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <ActivityIndicator size="large" color={isDark ? '#818CF8' : '#6366F1'} />
      </View>
    );
  }

  // Display error state
  if (error) {
    return (
      <View className={`flex-1 justify-center items-center p-5 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Ionicons name="alert-circle-outline" size={60} color={isDark ? '#F87171' : '#EF4444'} />
        <Text className={`text-lg font-semibold mb-4 mt-4 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
          Something went wrong
        </Text>
        <Text className={`mb-5 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {String(error)}
        </Text>
        <TouchableOpacity
          className={`py-3 px-6 rounded-lg ${isDark ? 'bg-indigo-500' : 'bg-indigo-600'}`}
          onPress={() => {
            setError(null);
            loadChat(chatId);
          }}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get offline mode status
  const isOfflineMode = user?.preferences?.useOfflineMode || false;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Animated.View 
        style={{ 
          flex: 1, 
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }]
        }}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={90}
        >
          {/* Chat header with title and back button */}
          <View className={`px-4 py-2 flex-row items-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <TouchableOpacity 
              className="pr-4 py-2" 
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
            </TouchableOpacity>
            <Text className={`flex-1 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`} numberOfLines={1}>
              {currentChat?.title || 'Chat'}
            </Text>
            <TouchableOpacity className="p-2">
              <Ionicons name="ellipsis-vertical" size={20} color={isDark ? '#E5E7EB' : '#4B5563'} />
            </TouchableOpacity>
          </View>
          
          {/* Mode indicator */}
          <View className={`absolute top-14 self-center z-10 ${isDark ? 'bg-gray-800' : 'bg-indigo-600'} rounded-full py-1 px-3 flex-row items-center shadow-md`}>
            <Ionicons 
              name={isOfflineMode ? "wifi-off-outline" : "cloud-outline"} 
              size={14} 
              color="#fff" 
            />
            <Text className="text-xs font-medium text-white ml-1">
              {isOfflineMode ? 'Offline Mode' : 'Online Mode'}
              {isOfflineMode && !isModelDownloaded && ' (Model not downloaded)'}
            </Text>
          </View>

          {/* Chat Messages */}
          <FlatList
            ref={flatListRef}
            data={currentChat?.messages || []}
            keyExtractor={(item, index) => item.id || `msg-${index}`}
            renderItem={renderMessage}
            contentContainerClassName={`p-4 pt-12 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
            ListEmptyComponent={
              <View className={`items-center justify-center py-8 mt-12 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <View className={`w-20 h-20 rounded-full ${isDark ? 'bg-gray-800' : 'bg-indigo-50'} items-center justify-center mb-4`}>
                  <Ionicons name="chatbubble-ellipses-outline" size={40} color={isDark ? '#818CF8' : '#6366F1'} />
                </View>
                <Text className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>No messages yet</Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} text-center mt-2 max-w-xs`}>
                  Start the conversation by typing a message below
                </Text>
              </View>
            }
          />

          {/* Input Area - with BlurView for a frosted glass effect */}
          <BlurView
            intensity={80}
            tint={isDark ? "dark" : "light"}
            className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
          >
            <View className="flex-row p-3">
              <TextInput
                className={`flex-1 rounded-full px-4 py-2 text-base mr-2 max-h-32 ${
                  isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
                }`}
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Type a message..."
                placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                multiline
                returnKeyType="default"
              />
              <TouchableOpacity
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  !inputMessage.trim() || isSending ? 
                    (isDark ? 'bg-gray-700' : 'bg-gray-400') : 
                    (isDark ? 'bg-indigo-500' : 'bg-indigo-600')
                }`}
                onPress={handleSendMessage}
                disabled={!inputMessage.trim() || isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
}