# Native AI App with Online/Offline Text Generation

A React Native mobile application with Node.js backend that provides text generation capabilities using both online (Google's Gemini API) and offline (Llama model) options.

## Features

- **Dual Text Generation**: Use Google's Gemini API online or run local Llama models offline
- **User Authentication**: Secure JWT-based authentication system
- **Chat History**: Persistent storage of conversations per user
- **Sentiment Analysis**: Automatic sentiment detection in user messages with supportive responses
- **Offline Mode**: Download and use smaller Llama models directly on the device
- **Cross-Platform**: Works on both iOS and Android devices

## Technologies

### Backend

- Node.js and Express
- MongoDB with Mongoose
- JWT Authentication
- Google Generative AI (Gemini API)
- Llama offline model integration
- Sentiment analysis

### Frontend (React Native)

- React Native
- React Navigation
- Async Storage
- TensorFlow.js (for offline models)

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local instance or Atlas)
- npm or yarn
- React Native development environment

### Backend Setup

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/ai-chat-app.git
   cd ai-chat-app/backend
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:

   ```
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/ai-chat-app
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   GEMINI_API_KEY=your_gemini_api_key
   LLAMA_MODEL_URL=https://example.com/path/to/llama-model.gguf
   MODEL_DIR=./models
   ```

4. Start the development server

   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory

   ```bash
   cd ../frontend
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env` file with your backend URL

   ```
   API_URL=http://localhost:5000/api
   ```

4. Start the React Native development server

   ```bash
   npx react-native start
   ```

5. Run on Android or iOS

   ```bash
   npx react-native run-android
   # or
   npx react-native run-ios
   ```

## Usage

### User Registration and Login

1. Open the app and create a new account
2. Log in with your credentials

### Choosing Online/Offline Mode

1. Navigate to Settings
2. Toggle between online and offline mode
3. If offline mode is selected for the first time, you'll be prompted to download the model

### Chat Interface

1. Create a new chat or select an existing conversation
2. Type your message and send
3. View AI-generated responses
4. Access conversation history anytime

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/preferences` - Update user preferences

### Chats

- `GET /api/chats` - Get all user chats
- `POST /api/chats` - Create a new chat
- `GET /api/chats/:id` - Get a single chat
- `DELETE /api/chats/:id` - Delete a chat
- `POST /api/chats/:id/messages` - Send a message in chat

### Model Management

- `POST /api/chats/model/download` - Download offline model
- `GET /api/chats/model/status` - Check model download status

## Project Structure

```
/root
├── backend/
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic (AI services)
│   │   ├── utils/        # Helper functions
│   │   └── server.js     # Main entry point
│   ├── models/           # Directory for downloaded models
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── api/          # API service methods
    │   ├── components/   # Reusable UI components
    │   ├── contexts/     # React contexts (auth, etc.)
    │   ├── models/       # Directory for offline models
    │   ├── navigation/   # React Navigation setup
    │   ├── screens/      # App screens
    │   ├── utils/        # Helper functions
    │   └── App.js        # Main app component
    ├── package.json
    └── .env
```

## Future Roadmap

- Add support for voice input/output
- Implement more advanced offline models
- Add multimedia content support in chats
- Enable chat export functionality
- Implement end-to-end encryption

## Performance Considerations

### Offline Mode

- The app uses smaller, quantized Llama models optimized for mobile devices
- First-time download of models may take significant time depending on internet speed
- Generation with offline models will be slower than online API calls
- Consider device storage requirements (100MB-1GB depending on model size)

### Online Mode

- Requires active internet connection
- Subject to Gemini API usage limits
- Faster response times compared to offline mode

## Security Notes

- All API requests require authentication token
- Passwords are hashed before storing in database
- Rate limiting is implemented to prevent abuse
- Sensitive environment variables should be properly secured

## License

MIT License

## Acknowledgements

- Google Generative AI for Gemini API
- Meta AI for Llama model architecture
- Contributors and maintainers.
