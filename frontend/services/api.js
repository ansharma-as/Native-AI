import axios from 'axios';
import Constants from 'expo-constants';

// Get the API URL from environment variables or use a default
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'hhttp://localhost:9191';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Set auth token for requests
  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  // Clear auth token
  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // GET request
  async get(path, params = {}) {
    try {
      const response = await this.client.get(path, { params });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  // POST request
  async post(path, data = {}) {
    try {
      const response = await this.client.post(path, data);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  // PUT request
  async put(path, data = {}) {
    try {
      const response = await this.client.put(path, data);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  // DELETE request
  async delete(path) {
    try {
      const response = await this.client.delete(path);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  // Handle errors
  _handleError(error) {
    if (error.response) {
      // Server responded with non-2xx status
      const message = error.response.data?.error || 'Server error occurred';
      
      // Handle authentication errors
      if (error.response.status === 401) {
        // Clear token if unauthorized
        this.clearAuthToken();
      }
      
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Unable to connect to server. Check your internet connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unknown error occurred');
    }
  }
}

// Create and export a singleton instance
const api = new ApiService();
export default api;