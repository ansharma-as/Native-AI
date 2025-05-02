// app/(app)/chat/_layout.jsx
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function ChatLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: '#f5f5f5',
      },
      headerTintColor: '#333',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerShadowVisible: false,
    }}>
      <Stack.Screen
        name="history"
        options={{
          title: "Chat History",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={({ route, navigation }) => ({
          title: "Chat",
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('history')}
              className="mr-4"
            >
              <Ionicons name="list-outline" size={24} color="#333" />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack>
  );
}