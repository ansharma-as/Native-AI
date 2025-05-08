// // app/(app)/_layout.jsx
// import { useContext, useEffect } from 'react';
// import { Tabs, useSegments, useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { AuthContext } from '../../contexts/AuthContext';

// const AppLayout = () => {
//   const { isAuthenticated, loading } = useContext(AuthContext);
//   const segments = useSegments();
//   const router = useRouter();

//   // Auth protection
//   useEffect(() => {
//     if (!loading && !isAuthenticated && segments[0] === '(app)') {
//       // Redirect to login if not authenticated
//       router.replace('/login');
//     }
//   }, [isAuthenticated, loading, segments]);

//   // Don't render anything while checking authentication
//   if (loading) {
//     return null;
//   }

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: '#5D5FEF',
//         tabBarInactiveTintColor: '#888',
//         tabBarStyle: {
//           borderTopWidth: 1,
//           borderTopColor: '#eee',
//         },
//         headerStyle: {
//           backgroundColor: '#f5f5f5',
//         },
//         headerTintColor: '#333',
//         headerTitleStyle: {
//           fontWeight: 'bold',
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Home",
//           tabBarIcon: ({ color }) => (
//             <Ionicons name="home-outline" size={24} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="chat"
//         options={{
//           title: "Chats",
//           tabBarIcon: ({ color }) => (
//             <Ionicons name="chatbubbles-outline" size={24} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="settings"
//         options={{
//           title: "Settings",
//           tabBarIcon: ({ color }) => (
//             <Ionicons name="settings-outline" size={24} color={color} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }

// export default AppLayout;



// app/(app)/_layout.jsx
import { useContext, useEffect } from 'react';
import { Tabs, useSegments, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { AuthContext } from '../../contexts/AuthContext';

const AppLayout = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const isDark = useSelector((state) => state.theme.isDark);
  const segments = useSegments();
  const router = useRouter();

  // Auth protection
  useEffect(() => {
    if (!loading && !isAuthenticated && segments[0] === '(app)') {
      // Redirect to login if not authenticated
      router.replace('/login');
    }
  }, [isAuthenticated, loading, segments]);

  // Don't render anything while checking authentication
  if (loading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#818CF8' : '#6366F1',
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
        tabBarStyle: {
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#374151' : '#E5E7EB',
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        },
        headerTintColor: isDark ? '#F9FAFB' : '#1F2937',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarItemStyle: {
          marginTop: 5,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-2 rounded-xl ${focused ? 'bg-opacity-15 bg-indigo-500' : ''}`}>
              <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-2 rounded-xl ${focused ? 'bg-opacity-15 bg-indigo-500' : ''}`}>
              <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-2 rounded-xl ${focused ? 'bg-opacity-15 bg-indigo-500' : ''}`}>
              <Ionicons name={focused ? "settings" : "settings-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

export default AppLayout;