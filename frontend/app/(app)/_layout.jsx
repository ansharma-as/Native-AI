// app/(app)/_layout.jsx
import { useContext, useEffect } from 'react';
import { Tabs, useSegments, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';

const AppLayout = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
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
        tabBarActiveTintColor: '#5D5FEF',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#eee',
        },
        headerStyle: {
          backgroundColor: '#f5f5f5',
        },
        headerTintColor: '#333',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chats",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubbles-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default AppLayout;

