

// // app/_layout.jsx
// import { Slot } from 'expo-router';
// import { AuthProvider } from '../contexts/AuthContext';
// import { StatusBar } from 'expo-status-bar';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import "../app/globals.css";

// export default function RootLayout() {
//   return (
//     <SafeAreaProvider>
//       <StatusBar style="auto" />
//       <AuthProvider>
//         <Slot />
//       </AuthProvider>
//     </SafeAreaProvider>
//   );
// }




// app/_layout.jsx (Root layout)
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from '../redux/store';
import { setSystemTheme } from '../redux/slices/themeSlice';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <RootLayoutNavigation />
      </AuthProvider>
    </Provider>
  );
}

function RootLayoutNavigation() {
  const isDark = useSelector((state) => state.theme.isDark);
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  
  // Update theme based on system changes
  useEffect(() => {
    dispatch(setSystemTheme(colorScheme));
  }, [colorScheme, dispatch]);
  
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}