const { GoogleGenerativeAI } = require('@google/generative-ai');
const Sentiment = require('sentiment');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const sentiment = new Sentiment();

// Online model with Gemini
class OnlineAIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  // Method to analyze sentiment
  analyzeSentiment(message) {
    const result = sentiment.analyze(message);
    if (result.score < 0) {
      return 'negative';
    } else if (result.score > 0) {
      return 'positive';
    }
    return 'neutral';
  }

  // Method to get supportive response based on sentiment
  getSupportiveResponse(sentimentType, userMessage) {
    if (sentimentType === 'negative') {
      return {
        text: `I'm really sorry to hear you're feeling this way. Remember, it's okay to have tough days. ${this.provideCopingMechanism(userMessage)}`,
        suggestion: "Would you like me to guide you through a quick breathing exercise or share some study techniques?",
      };
    } else if (sentimentType === 'positive') {
      return {
        text: "It sounds like you're doing well! Keep up the good work. Staying positive is great, but don't forget to take breaks and practice self-care!",
        suggestion: "Would you like some tips on staying focused and stress-free while studying?",
      };
    } else {
      return {
        text: "I'm here to help you with whatever you need. How can I assist you today?",
      };
    }
  }

  // Helper method for providing coping mechanisms
  provideCopingMechanism(userMessage) {
    if (userMessage.includes('anxiety') || userMessage.includes('anxious')) {
      return "Have you tried taking a few deep breaths or stepping away for a quick break? Sometimes, focusing on just one task at a time can help reduce overwhelm.";
    } else if (userMessage.includes('overwhelmed')) {
      return "It sounds like a lot is going on right now. Breaking tasks into smaller steps can help you manage. Would you like me to help you plan out your next steps?";
    } else if (userMessage.includes('sad')) {
      return "It's okay to feel sad sometimes. Talking to a trusted friend or journaling your thoughts can make a big difference. Do you need help finding ways to cope?";
    }
    return "Make sure you're getting enough sleep, eating healthy, and taking care of your mental health. These small habits go a long way!";
  }

  // Method to generate text using Gemini API
  async generateText(userMessage, history = []) {
    try {
      let chatHistory = [];
      
      // Format history for Gemini API
      if (history && history.length > 0) {
        chatHistory = history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }));
      }

      // Start chat with history
      const chat = this.model.startChat({
        history: chatHistory
      });

      // Send message and get response
      const result = await chat.sendMessage(userMessage);
      return result.response.text();
    } catch (error) {
      console.error('Error generating text with online model:', error);
      throw error;
    }
  }
}

// Offline model with Llama
class OfflineAIService {
  constructor() {
    this.modelPath = path.join(process.env.MODEL_DIR || './models', 'llama-2-7b-chat.gguf');
    this.modelDownloaded = false;
  }

  // Check if model exists locally
  async isModelDownloaded() {
    try {
      await fs.promises.access(this.modelPath);
      this.modelDownloaded = true;
      return true;
    } catch (error) {
      this.modelDownloaded = false;
      return false;
    }
  }

  // Download model from source
  async downloadModel() {
    // Ensure the models directory exists
    const modelDir = path.dirname(this.modelPath);
    try {
      await fs.promises.mkdir(modelDir, { recursive: true });
    } catch (error) {
      console.error('Error creating model directory:', error);
      throw error;
    }

    // Model URL (this should be configured based on your model source)
    const modelUrl = process.env.LLAMA_MODEL_URL;
    if (!modelUrl) {
      throw new Error('Model URL not configured');
    }

    try {
      // Download the model file
      console.log('Downloading Llama model...');
      const response = await axios({
        method: 'GET',
        url: modelUrl,
        responseType: 'stream'
      });

      // Save the file
      const writer = fs.createWriteStream(this.modelPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log('Model download complete');
          this.modelDownloaded = true;
          resolve(true);
        });
        writer.on('error', (error) => {
          console.error('Model download failed:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error downloading model:', error);
      throw error;
    }
  }

  // Generate text using Llama model
  async generateText(userMessage, history = []) {
    // Check if model is downloaded
    const isDownloaded = await this.isModelDownloaded();
    if (!isDownloaded) {
      throw new Error('Model not downloaded. Please download the model first.');
    }

    // Prepare prompt with history
    let prompt = '';
    if (history && history.length > 0) {
      for (const msg of history) {
        if (msg.role === 'user') {
          prompt += `USER: ${msg.content}\n`;
        } else {
          prompt += `ASSISTANT: ${msg.content}\n`;
        }
      }
    }
    prompt += `USER: ${userMessage}\nASSISTANT:`;

    // Run llama.cpp in a child process
    // Note: This requires llama.cpp to be installed and accessible in the path
    return new Promise((resolve, reject) => {
      try {
        const llamaProcess = spawn('llama-cli', [
          '-m', this.modelPath,
          '--prompt', prompt,
          '--temp', '0.7',
          '--top-p', '0.9',
          '--max-tokens', '512'
        ]);

        let output = '';
        llamaProcess.stdout.on('data', (data) => {
          output += data.toString();
        });

        llamaProcess.stderr.on('data', (data) => {
          console.error(`llama stderr: ${data}`);
        });

        llamaProcess.on('close', (code) => {
          if (code === 0) {
            // Extract just the assistant's response
            const response = output.split('ASSISTANT:').pop().trim();
            resolve(response);
          } else {
            reject(new Error(`llama process exited with code ${code}`));
          }
        });
      } catch (error) {
        console.error('Error running offline model:', error);
        reject(error);
      }
    });
  }

  // Uses same sentiment analysis as online model
  analyzeSentiment(message) {
    const result = sentiment.analyze(message);
    if (result.score < 0) {
      return 'negative';
    } else if (result.score > 0) {
      return 'positive';
    }
    return 'neutral';
  }

  // Uses same supportive responses as online model
  getSupportiveResponse(sentimentType, userMessage) {
    const onlineService = new OnlineAIService();
    return onlineService.getSupportiveResponse(sentimentType, userMessage);
  }

  provideCopingMechanism(userMessage) {
    const onlineService = new OnlineAIService();
    return onlineService.provideCopingMechanism(userMessage);
  }
}

// Factory to get the appropriate AI service
exports.getAIService = async (preferOffline = false) => {
  if (preferOffline) {
    const offlineService = new OfflineAIService();
    const isModelDownloaded = await offlineService.isModelDownloaded();
    
    if (isModelDownloaded) {
      return offlineService;
    } else {
      console.warn('Offline model not available, falling back to online model');
      return new OnlineAIService();
    }
  } else {
    return new OnlineAIService();
  }
};

// Helper to download the model
exports.downloadOfflineModel = async () => {
  const offlineService = new OfflineAIService();
  return await offlineService.downloadModel();
};

// Helper to check if model is downloaded
exports.isModelDownloaded = async () => {
  const offlineService = new OfflineAIService();
  return await offlineService.isModelDownloaded();
};
