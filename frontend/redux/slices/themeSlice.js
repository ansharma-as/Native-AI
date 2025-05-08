// redux/slices/themeSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { useColorScheme } from 'react-native';

// Initial state based on system preference
const initialState = {
  isDark: useColorScheme() === 'dark',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
    },
    setDarkTheme: (state) => {
      state.isDark = true;
    },
    setLightTheme: (state) => {
      state.isDark = false;
    },
    setSystemTheme: (state, action) => {
      state.isDark = action.payload === 'dark';
    },
  },
});

export const { toggleTheme, setDarkTheme, setLightTheme, setSystemTheme } = themeSlice.actions;

export default themeSlice.reducer;