import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDark: false,
  primaryColor: '#6366F1', // Indigo
  accentColor: '#F59E0B', // Amber
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
    },
    setTheme: (state, action) => {
      state.isDark = action.payload;
    },
    setPrimaryColor: (state, action) => {
      state.primaryColor = action.payload;
    },
    setAccentColor: (state, action) => {
      state.accentColor = action.payload;
    },
    resetTheme: (state) => {
      state.isDark = false;
      state.primaryColor = '#6366F1';
      state.accentColor = '#F59E0B';
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  setPrimaryColor,
  setAccentColor,
  resetTheme,
} = themeSlice.actions;

export default themeSlice.reducer;