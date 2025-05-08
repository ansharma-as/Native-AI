// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
// Import other reducers here

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    // Add other reducers here
  },
});