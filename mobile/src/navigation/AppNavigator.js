import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

// Auth Navigator
function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Main App Navigator
function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen 
        name="ChatList" 
        component={ChatListScreen}
        options={{
          title: 'Chats',
        }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          title: 'Chat',
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Stack.Navigator>
  );
}

// Root Navigator
export default function AppNavigator() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}