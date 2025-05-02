// // app/(app)/settings/model.jsx
// import React, { useContext, useState } from 'react';
// import {
//   View,
//   Text,
//   Switch,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { AuthContext } from '../../../contexts/AuthContext';
// import { ChatContext } from '../../../contexts/ChatContext';
// import * as Progress from 'expo-progress';

// export default function ModelSettingsScreen() {
//   const { user, updatePreferences } = useContext(AuthContext);
//   const { 
//     isModelDownloaded, 
//     isModelDownloading,
//     modelDownloadProgress,
//     downloadOfflineModel,
//     checkOfflineModelStatus
//   } = useContext(ChatContext);
  
//   const [useOfflineMode, setUseOfflineMode] = useState(
//     user?.preferences?.useOfflineMode || false
//   );
  
//   const [loading, setLoading] = useState(false);

//   // Toggle offline mode
//   const handleToggleOfflineMode = async (value) => {
//     setLoading(true);
    
//     // If switching to offline mode and model is not downloaded
//     if (value && !isModelDownloaded) {
//       Alert.alert(
//         "Download Required",
//         "To use offline mode, you need to download the AI model. Would you like to download it now?",
//         [
//           {
//             text: "Yes, Download",
//             onPress: async () => {
//               // First update preference
//               await updatePreferences({ useOfflineMode: value });
//               setUseOfflineMode(value);
//               // Then start download
//               await downloadOfflineModel();
//             }
//           },
//           {
//             text: "No, Stay Online",
//             onPress: () => {
//               // Keep online mode
//               setUseOfflineMode(false);
//             }
//           }
//         ]
//       );
//     } else {
//       // Just update preference if no download needed
//       await updatePreferences({ useOfflineMode: value });
//       setUseOfflineMode(value);
//     }
    
//     setLoading(false);
//   };

//   // Initialize offline model download
//   const handleDownload = async () => {
//     if (isModelDownloading) {
//       Alert.alert("Download in Progress", "The model is already downloading. Please wait.");
//       return;
//     }
    
//     if (isModelDownloaded) {
//       Alert.alert("Already Downloaded", "The offline model is already downloaded.");
//       return;
//     }
    
//     Alert.alert(
//       "Download Model",
//       "This will download the AI model (approximately 200MB). Make sure you're connected to Wi-Fi.",
//       [
//         {
//           text: "Cancel",
//           style: "cancel"
//         },
//         {
//           text: "Download",
//           onPress: () => downloadOfflineModel()
//         }
//       ]
//     );
//   };

//   // Check model status
//   const handleCheckStatus = async () => {
//     const status = await checkOfflineModelStatus();
//     Alert.alert(
//       "Model Status",
//       `Status: ${status.isDownloaded ? 'Downloaded' : 'Not Downloaded'}\n${
//         status.downloadProgress ? `Download Progress: ${Math.round(status.downloadProgress * 100)}%` : ''
//       }`
//     );
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom']}>
//       <View className="p-5">
//         <Text className="text-2xl font-bold text-gray-800 mb-2">AI Model Settings</Text>
//         <Text className="text-base text-gray-600">
//           Choose between online and offline text generation
//         </Text>
//       </View>

//       <View className="flex-1">
//         <View className="mb-6">
//           <Text className="text-lg font-semibold text-gray-800 mx-5 mb-2">Generation Mode</Text>
          
//           <View className="flex-row items-center bg-white p-4">
//             <View className="flex-1 mr-2">
//               <Text className="text-base font-medium text-gray-800">Use Offline Mode</Text>
//               <Text className="text-sm text-gray-600">
//                 Generate text using on-device AI model (requires download)
//               </Text>
//             </View>
//             {loading ? (
//               <ActivityIndicator size="small" color="#5D5FEF" />
//             ) : (
//               <Switch
//                 value={useOfflineMode}
//                 onValueChange={handleToggleOfflineMode}
//                 trackColor={{ false: '#ccc', true: '#bdc5ff' }}
//                 thumbColor={useOfflineMode ? '#5D5FEF' : '#f4f4f4'}
//                 ios_backgroundColor="#ccc"
//               />
//             )}
//           </View>
          
//           <View className="bg-indigo-50 p-4 mx-5 rounded-lg mt-4">
//             <Text className="text-base font-medium text-gray-800">
//               Currently using: {useOfflineMode ? 'Offline' : 'Online'} mode
//             </Text>
            
//             {useOfflineMode && (
//               <Text className="text-sm text-gray-600 mt-1">
//                 {isModelDownloaded
//                   ? 'Using Llama model for offline text generation'
//                   : 'Offline model not downloaded yet - download required'}
//               </Text>
//             )}
            
//             {!useOfflineMode && (
//               <Text className="text-sm text-gray-600 mt-1">
//                 Using Gemini API for online text generation
//               </Text>
//             )}
//           </View>
//         </View>

//         <View className="mb-6">
//           <Text className="text-lg font-semibold text-gray-800 mx-5 mb-2">Offline Model</Text>
          
//           {isModelDownloading && (
//             <View className="bg-white p-4 mx-5 rounded-lg mb-4">
//               <Text className="text-base font-medium text-gray-800 mb-2">Downloading model...</Text>
              
//               <Progress.Bar
//                 progress={modelDownloadProgress}
//                 width={null}
//                 height={8}
//                 color="#5D5FEF"
//                 unfilledColor="#e0e0e0"
//                 borderWidth={0}
//                 className="my-2"
//               />
              
//               <Text className="text-sm text-gray-600 text-right">
//                 {Math.round(modelDownloadProgress * 100)}% Complete
//               </Text>
//             </View>
//           )}
          
//           <TouchableOpacity
//             className={`flex-row items-center justify-center mx-5 p-4 rounded-lg mb-2 ${
//               (isModelDownloaded || isModelDownloading) ? 'bg-gray-400' : 'bg-indigo-600'
//             }`}
//             onPress={handleDownload}
//             disabled={isModelDownloaded || isModelDownloading}
//           >
//             <Ionicons name="cloud-download-outline" size={24} color="#fff" />
//             <Text className="text-white text-base font-semibold ml-2">
//               {isModelDownloaded
//                 ? 'Model Downloaded'
//                 : isModelDownloading
//                 ? 'Downloading...'
//                 : 'Download Offline Model'}
//             </Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             className="flex-row items-center justify-center mx-5 p-4 rounded-lg mb-2 bg-white border border-indigo-600"
//             onPress={handleCheckStatus}
//           >
//             <Ionicons name="refresh-outline" size={24} color="#5D5FEF" />
//             <Text className="text-indigo-600 text-base font-semibold ml-2">
//               Check Model Status
//             </Text>
//           </TouchableOpacity>
//         </View>

//         <View className="mx-5">
//           <Text className="text-lg font-semibold text-gray-800 mb-4">Mode Comparison</Text>
          
//           <View className="bg-white rounded-lg overflow-hidden">
//             <View className="flex-row">
//               <View className="flex-1 p-3 bg-gray-100"></View>
//               <View className="flex-1 p-3 bg-gray-100">
//                 <Text className="text-center font-semibold text-gray-800">Online</Text>
//               </View>
//               <View className="flex-1 p-3 bg-gray-100">
//                 <Text className="text-center font-semibold text-gray-800">Offline</Text>
//               </View>
//             </View>
            
//             <View className="flex-row border-b border-gray-100">
//               <View className="flex-1 p-3 bg-gray-50">
//                 <Text className="text-gray-600">Text Quality</Text>
//               </View>
//               <View className="flex-1 p-3 items-center justify-center">
//                 <Text className="text-center">High</Text>
//               </View>
//               <View className="flex-1 p-3 items-center justify-center">
//                 <Text className="text-center">Good</Text>
//               </View>
//             </View>
            
//             <View className="flex-row border-b border-gray-100">
//               <View className="flex-1 p-3 bg-gray-50">
//                 <Text className="text-gray-600">Internet Required</Text>
//               </View>
//               <View className="flex-1 p-3 items-center justify-center">
//                 <Ionicons name="checkmark" size={20} color="#5D5FEF" />
//               </View>
//               <View className="flex-1 p-3 items-center justify-center">
//                 <Ionicons name="close" size={20} color="#ff3b30" />
//               </View>
//             </View>
            
//             <View className="flex-row border-b border-gray-100">
//               <View className="flex-1 p-3 bg-gray-50">
//                 <Text className="text-gray-600">Device Storage</Text>
//               </View>
//               <View className="flex-1 p-3 items-center justify-center">
//                 <Text className="text-center">None</Text>
//               </View>
//               <View className="flex-1 p-3 items-center justify-center">
//                 <Text className="text-center">~200MB</Text>
//               </View>
//             </View>
            
//             <View className="flex-row">
//               <View className="flex-1 p-3 bg-gray-50">
//                 <Text className="text-gray-600">Privacy</Text>
//               </View>
//               <View className="flex-1 p-3 items-center justify-center">
//                 <Text className="text-center">Standard</Text>
//               </View>
//               <View className="flex-1 p-3 items-center justify-center">
//                 <Text className="text-center">Enhanced</Text>
//               </View>
//             </View>
//           </View>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }


// app/(app)/settings/model.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Custom progress bar component to replace expo-progress
const ProgressBar = ({ progress, color = '#5D5FEF', height = 8 }) => {
  return (
    <View style={{ 
      height, 
      width: '100%', 
      backgroundColor: '#e0e0e0', 
      borderRadius: height,
      overflow: 'hidden' 
    }}>
      <View 
        style={{
          height: '100%',
          width: `${progress * 100}%`,
          backgroundColor: color,
          borderRadius: height
        }}
      />
    </View>
  );
};

export default function ModelSettingsScreen() {
  // Mock data for testing without context
  const [useOfflineMode, setUseOfflineMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModelDownloaded, setIsModelDownloaded] = useState(false);
  const [isModelDownloading, setIsModelDownloading] = useState(false);
  const [modelDownloadProgress, setModelDownloadProgress] = useState(0);

  // Calculate safe area padding manually
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

  // Mock functions for testing
  const handleToggleOfflineMode = async (value) => {
    setLoading(true);
    
    // If switching to offline mode and model is not downloaded
    if (value && !isModelDownloaded) {
      Alert.alert(
        "Download Required",
        "To use offline mode, you need to download the AI model. Would you like to download it now?",
        [
          {
            text: "Yes, Download",
            onPress: async () => {
              // Update state for testing
              setUseOfflineMode(value);
              // Simulate download
              simulateDownload();
            }
          },
          {
            text: "No, Stay Online",
            onPress: () => {
              setUseOfflineMode(false);
            }
          }
        ]
      );
    } else {
      // Just update preference if no download needed
      setUseOfflineMode(value);
    }
    
    setLoading(false);
  };

  // Simulate download progress
  const simulateDownload = () => {
    setIsModelDownloading(true);
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 0.05;
      setModelDownloadProgress(progress);
      
      if (progress >= 1) {
        clearInterval(interval);
        setIsModelDownloading(false);
        setIsModelDownloaded(true);
        Alert.alert("Download Complete", "The offline model has been downloaded successfully.");
      }
    }, 500);
  };

  const handleDownload = () => {
    if (isModelDownloading) {
      Alert.alert("Download in Progress", "The model is already downloading. Please wait.");
      return;
    }
    
    if (isModelDownloaded) {
      Alert.alert("Already Downloaded", "The offline model is already downloaded.");
      return;
    }
    
    Alert.alert(
      "Download Model",
      "This will download the AI model (approximately 200MB). Make sure you're connected to Wi-Fi.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Download",
          onPress: simulateDownload
        }
      ]
    );
  };

  const handleCheckStatus = () => {
    Alert.alert(
      "Model Status",
      `Status: ${isModelDownloaded ? 'Downloaded' : 'Not Downloaded'}\n${
        isModelDownloading ? `Download Progress: ${Math.round(modelDownloadProgress * 100)}%` : ''
      }`
    );
  };

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: '#f3f4f6',
      paddingTop: statusBarHeight 
    }}>
      <View className="p-5">
        <Text className="text-2xl font-bold text-gray-800 mb-2">AI Model Settings</Text>
        <Text className="text-base text-gray-600">
          Choose between online and offline text generation
        </Text>
      </View>

      <View className="flex-1">
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mx-5 mb-2">Generation Mode</Text>
          
          <View className="flex-row items-center bg-white p-4 mx-5 rounded-lg">
            <View className="flex-1 mr-2">
              <Text className="text-base font-medium text-gray-800">Use Offline Mode</Text>
              <Text className="text-sm text-gray-600">
                Generate text using on-device AI model (requires download)
              </Text>
            </View>
            {loading ? (
              <ActivityIndicator size="small" color="#5D5FEF" />
            ) : (
              <Switch
                value={useOfflineMode}
                onValueChange={handleToggleOfflineMode}
                trackColor={{ false: '#ccc', true: '#bdc5ff' }}
                thumbColor={useOfflineMode ? '#5D5FEF' : '#f4f4f4'}
              />
            )}
          </View>
          
          <View className="bg-indigo-50 p-4 mx-5 rounded-lg mt-4">
            <Text className="text-base font-medium text-gray-800">
              Currently using: {useOfflineMode ? 'Offline' : 'Online'} mode
            </Text>
            
            {useOfflineMode && (
              <Text className="text-sm text-gray-600 mt-1">
                {isModelDownloaded
                  ? 'Using Llama model for offline text generation'
                  : 'Offline model not downloaded yet - download required'}
              </Text>
            )}
            
            {!useOfflineMode && (
              <Text className="text-sm text-gray-600 mt-1">
                Using Gemini API for online text generation
              </Text>
            )}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mx-5 mb-2">Offline Model</Text>
          
          {isModelDownloading && (
            <View className="bg-white p-4 mx-5 rounded-lg mb-4">
              <Text className="text-base font-medium text-gray-800 mb-2">Downloading model...</Text>
              
              <ProgressBar progress={modelDownloadProgress} />
              
              <Text className="text-sm text-gray-600 text-right mt-2">
                {Math.round(modelDownloadProgress * 100)}% Complete
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            className={`flex-row items-center justify-center mx-5 p-4 rounded-lg mb-2 ${
              (isModelDownloaded || isModelDownloading) ? 'bg-gray-400' : 'bg-indigo-600'
            }`}
            onPress={handleDownload}
            disabled={isModelDownloaded || isModelDownloading}
          >
            <Ionicons name="cloud-download-outline" size={24} color="#fff" />
            <Text className="text-white text-base font-semibold ml-2">
              {isModelDownloaded
                ? 'Model Downloaded'
                : isModelDownloading
                ? 'Downloading...'
                : 'Download Offline Model'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-row items-center justify-center mx-5 p-4 rounded-lg mb-2 bg-white border border-indigo-600"
            onPress={handleCheckStatus}
          >
            <Ionicons name="refresh-outline" size={24} color="#5D5FEF" />
            <Text className="text-indigo-600 text-base font-semibold ml-2">
              Check Model Status
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mx-5">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Mode Comparison</Text>
          
          <View className="bg-white rounded-lg overflow-hidden">
            <View className="flex-row">
              <View className="flex-1 p-3 bg-gray-100"></View>
              <View className="flex-1 p-3 bg-gray-100">
                <Text className="text-center font-semibold text-gray-800">Online</Text>
              </View>
              <View className="flex-1 p-3 bg-gray-100">
                <Text className="text-center font-semibold text-gray-800">Offline</Text>
              </View>
            </View>
            
            <View className="flex-row border-b border-gray-100">
              <View className="flex-1 p-3 bg-gray-50">
                <Text className="text-gray-600">Text Quality</Text>
              </View>
              <View className="flex-1 p-3 items-center justify-center">
                <Text className="text-center">High</Text>
              </View>
              <View className="flex-1 p-3 items-center justify-center">
                <Text className="text-center">Good</Text>
              </View>
            </View>
            
            <View className="flex-row border-b border-gray-100">
              <View className="flex-1 p-3 bg-gray-50">
                <Text className="text-gray-600">Internet Required</Text>
              </View>
              <View className="flex-1 p-3 items-center justify-center">
                <Ionicons name="checkmark" size={20} color="#5D5FEF" />
              </View>
              <View className="flex-1 p-3 items-center justify-center">
                <Ionicons name="close" size={20} color="#ff3b30" />
              </View>
            </View>
            
            <View className="flex-row border-b border-gray-100">
              <View className="flex-1 p-3 bg-gray-50">
                <Text className="text-gray-600">Device Storage</Text>
              </View>
              <View className="flex-1 p-3 items-center justify-center">
                <Text className="text-center">None</Text>
              </View>
              <View className="flex-1 p-3 items-center justify-center">
                <Text className="text-center">~200MB</Text>
              </View>
            </View>
            
            <View className="flex-row">
              <View className="flex-1 p-3 bg-gray-50">
                <Text className="text-gray-600">Privacy</Text>
              </View>
              <View className="flex-1 p-3 items-center justify-center">
                <Text className="text-center">Standard</Text>
              </View>
              <View className="flex-1 p-3 items-center justify-center">
                <Text className="text-center">Enhanced</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}