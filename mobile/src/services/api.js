import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://799c-2a09-bac1-36e0-198-00-1ae-5.ngrok-free.app/api';
const API_URL = 'https://799c-2a09-bac1-36e0-198-00-1ae-5.ngrok-free.app/api';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
    this.token = null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
  }

  // Get authentication token from secure storage
  async getToken() {
    if (!this.token) {
      this.token = await SecureStore.getItemAsync('authToken');
    }
    return this.token;
  }

  // Remove token
  async removeToken() {
    this.token = null;
    await SecureStore.deleteItemAsync('authToken');
  }

  // Create request headers
  async createHeaders(contentType = 'application/json') {
    const headers = {
      'Content-Type': contentType,
    };

    const token = await this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic HTTP request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.createHeaders();
    
    const config = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    if (response.success && response.token) {
      await SecureStore.setItemAsync('authToken', response.token);
      this.setToken(response.token);
    }
    return response;
  }

  async register(username, email, password) {
    const response = await this.post('/auth/register', { username, email, password });
    if (response.success && response.token) {
      await SecureStore.setItemAsync('authToken', response.token);
      this.setToken(response.token);
    }
    return response;
  }

  async logout() {
    await this.removeToken();
    return { success: true };
  }

  // Chat methods
  async getChats() {
    return this.get('/chats');
  }

  async getChat(chatId) {
    return this.get(`/chats/${chatId}`);
  }

  async createChat(title, modelType = 'online') {
    return this.post('/chats', { title, model_type: modelType });
  }

  async sendMessage(chatId, message, useOffline = false) {
    return this.post(`/chats/${chatId}/messages`, { message, useOffline });
  }

  async deleteChat(chatId) {
    return this.delete(`/chats/${chatId}`);
  }

  async searchChats(query) {
    return this.get(`/chats/search?query=${encodeURIComponent(query)}`);
  }

  // Model methods
  async checkModelStatus() {
    return this.get('/chats/model/status');
  }

  async downloadModel() {
    return this.post('/chats/model/download');
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;