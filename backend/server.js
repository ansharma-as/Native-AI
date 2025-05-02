// const cors = require('cors');
// const express = require('express');
// const axios = require('axios');
// require('dotenv').config();
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const Sentiment = require('sentiment'); 

// const app = express();
// const port = process.env.PORT;

// app.use(cors());
// app.use(express.json());

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// const sentiment = new Sentiment();

// const analyzeSentiment = (message) => {
//   const result = sentiment.analyze(message);
//   if (result.score < 0) {
//     return 'negative';
//   } else if (result.score > 0) {
//     return 'positive';
//   }
//   return 'neutral';
// };

// const getSupportiveResponse = (sentiment, userMessage) => {
//   if (sentiment === 'negative') {
//     return {
//       text: `I'm really sorry to hear you're feeling this way. Remember, it's okay to have tough days. ${provideCopingMechanism(userMessage)}`,
//       suggestion: "Would you like me to guide you through a quick breathing exercise or share some study techniques?",
//     };
//   } else if (sentiment === 'positive') {
//     return {
//       text: "It sounds like you're doing well! Keep up the good work. Staying positive is great, but don't forget to take breaks and practice self-care!",
//       suggestion: "Would you like some tips on staying focused and stress-free while studying?",
//     };
//   } else {
//     return {
//       text: "I'm here to help you with whatever you need. How can I assist you today?",
//     };
//   }
// };

// const provideCopingMechanism = (userMessage) => {
//   if (userMessage.includes('anxiety') || userMessage.includes('anxious')) {
//     return "Have you tried taking a few deep breaths or stepping away for a quick break? Sometimes, focusing on just one task at a time can help reduce overwhelm.";
//   } else if (userMessage.includes('overwhelmed')) {
//     return "It sounds like a lot is going on right now. Breaking tasks into smaller steps can help you manage. Would you like me to help you plan out your next steps?";
//   } else if (userMessage.includes('sad')) {
//     return "It's okay to feel sad sometimes. Talking to a trusted friend or journaling your thoughts can make a big difference. Do you need help finding ways to cope?";
//   }
//   return "Make sure you're getting enough sleep, eating healthy, and taking care of your mental health. These small habits go a long way!";
// };


// const trimUserMessageFromResponse = (aiResponse, userMessage) => {
//     const trimmedResponse = aiResponse.replace(new RegExp(`\\b${userMessage}\\b`, 'i'), '').trim();
//     return trimmedResponse;
//   };
// app.post('/api/chat', async (req, res) => {
//   const { userMessage } = req.body;

//   const sentimentScore = analyzeSentiment(userMessage);

//   const supportiveResponse = getSupportiveResponse(sentimentScore, userMessage);

//   try {
//     const chat = model.startChat({
//       history: [
//         {
//           role: 'user',
//           parts: [{ text: userMessage }],
//         },
//       ],
//     });

//     const result = await chat.sendMessage(userMessage);
//     const trimmedAIResponse = trimUserMessageFromResponse(result.response.text(), userMessage);


//     res.json({
//       response: supportiveResponse.text,
//       suggestion: supportiveResponse.suggestion,
//       aiResponse: trimmedAIResponse,
//     });
//   } catch (error) {
//     console.error('Error communicating with Gemini API:', error.message);
//     res.status(500).json({ error: 'An error occurred while processing your request.' });
//   }
// });

// app.get('/', (req, res) => {
//   res.send('Backend is running fine.');
// });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });








const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

const connectDB = require('./config/db');
const routes = require('./routes/index.route');

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(cors());





// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Dev logging middleware
// if (NODE_ENV === 'development') {
// }

// Mount routes
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('API is running');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
