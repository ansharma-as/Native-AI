# AI Chat Mobile App

A beautiful React Native chat application with AI integration, built with modern technologies and clean architecture.

## 🚀 Features

### ✨ Authentication
- **Beautiful Login/Register screens** with gradient backgrounds
- **Secure token storage** using Expo SecureStore
- **Form validation** with user-friendly error messages
- **Auto-login** persistence between app sessions

### 💬 Chat Interface
- **Real-time messaging** with REST API polling
- **Animated message bubbles** with timestamps
- **Typing indicators** for better UX
- **Message suggestions** based on AI sentiment analysis
- **Auto-scroll** to latest messages

### 🎨 Modern UI/UX
- **Dark/Light theme** toggle with Redux state management
- **Tailwind CSS** styling for consistent design
- **Gradient backgrounds** and smooth animations
- **Glass-morphism effects** using Expo LinearGradient
- **Beautiful icons** with Expo Vector Icons

### 📱 Navigation
- **Stack navigation** with smooth transitions
- **Gesture-based navigation** for iOS-like experience
- **Conditional routing** based on authentication state

### ⚙️ Settings & Configuration
- **Theme customization** (Dark/Light mode)
- **Offline model management** for privacy
- **Account management** with user profile
- **Model download status** tracking

## 🛠 Tech Stack

- **React Native** with Expo SDK 53
- **Redux Toolkit** for state management
- **React Navigation 7** for navigation
- **Tailwind CSS** via NativeWind for styling
- **Expo SecureStore** for secure token storage
- **Expo LinearGradient** for beautiful gradients
- **REST API** integration with custom polling service

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── navigation/          # Navigation configuration
├── redux/              # Redux store and slices
│   ├── slices/         # Auth and theme slices
│   └── store.js        # Redux store configuration
├── screens/            # Screen components
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── ChatListScreen.js
│   ├── ChatScreen.js
│   └── SettingsScreen.js
└── services/           # API and business logic
    ├── api.js          # HTTP client with fetch
    └── realtimeService.js # Real-time polling service
```

## 🔧 Backend Integration

The app connects to a Node.js backend with the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Chat Management
- `GET /api/chats` - Get user's chats (limited to 10)
- `GET /api/chats/:id` - Get specific chat
- `POST /api/chats` - Create new chat
- `POST /api/chats/:id/messages` - Send message
- `DELETE /api/chats/:id` - Delete chat
- `GET /api/chats/search?query=` - Search chats

### AI Model Management
- `GET /api/chats/model/status` - Check offline model status
- `POST /api/chats/model/download` - Download offline model

## 🎯 Key Features Implemented

1. **Authentication Flow**
   - Secure login/register with validation
   - Token persistence and auto-login
   - Beautiful gradient UI with animations

2. **Chat Experience**
   - Real-time message updates via polling
   - Message bubbles with animations
   - Typing indicators and connection status
   - Search functionality across chats

3. **State Management**
   - Redux for auth and theme state
   - Persistent theme preferences
   - Clean separation of concerns

4. **API Integration**
   - Custom fetch-based API service
   - Real-time polling service replacing WebSockets
   - Error handling and retry logic

5. **UI/UX Excellence**
   - Consistent design language
   - Smooth animations and transitions
   - Dark/Light theme support
   - Responsive layouts

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on device/simulator:**
   ```bash
   npm run ios     # For iOS
   npm run android # For Android
   npm run web     # For web
   ```

## 🔧 Configuration

Update the API URL in `src/services/api.js` to point to your backend server:

```javascript
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:9191/api';
```

## 📱 Screenshots

The app features:
- Beautiful gradient login/register screens
- Modern chat interface with message bubbles
- Dark/Light theme toggle
- Settings screen with account management
- Search functionality for chat history

## 🎨 Design Philosophy

- **Clean & Modern**: Minimalist design with focus on usability
- **Consistent**: Unified design language across all screens
- **Accessible**: Dark/Light theme support for user preference
- **Responsive**: Optimized for various screen sizes
- **Performant**: Efficient state management and API calls

## 🔐 Security

- Secure token storage using Expo SecureStore
- No sensitive data stored in plain text
- Proper authentication state management
- API error handling and validation

---

Built with ❤️ using React Native and modern development practices.