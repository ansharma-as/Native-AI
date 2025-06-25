const WebSocket = require('ws');
const MCPProtocol = require('./protocol');
const aiService = require('../services/ai.service');

class MCPServer {
  constructor(httpServer) {
    this.protocol = new MCPProtocol();
    this.clients = new Map();
    this.sessions = new Map();
    
    // Create WebSocket server
    this.wss = new WebSocket.Server({ 
      server: httpServer,
      path: '/mcp'
    });
    
    this.setupWebSocketHandlers();
  }

  setupWebSocketHandlers() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      
      console.log(`MCP Client connected: ${clientId}`);
      
      // Store client connection
      this.clients.set(clientId, {
        ws,
        clientId,
        connectedAt: new Date(),
        sessions: new Set()
      });

      // Setup message handler
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleClientMessage(clientId, message);
        } catch (error) {
          console.error('Invalid JSON message:', error);
          this.sendError(ws, null, -32700, 'Parse error');
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        console.log(`MCP Client disconnected: ${clientId}`);
        this.cleanupClient(clientId);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`MCP Client error for ${clientId}:`, error);
        this.cleanupClient(clientId);
      });

      // Send initial handshake
      this.sendHandshake(ws);
    });
  }

  async handleClientMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) {
      console.error(`Client ${clientId} not found`);
      return;
    }

    // Validate message format
    if (!this.protocol.validateMessage(message)) {
      this.sendError(client.ws, message.id, -32600, 'Invalid Request');
      return;
    }

    // Create context for the message
    const context = {
      clientId,
      client,
      aiService,
      sessions: this.sessions
    };

    try {
      const response = await this.protocol.handleMessage(message, context);
      
      if (response) {
        client.ws.send(JSON.stringify(response));
        
        // Handle special cases
        if (message.method === 'session/create' && response.result) {
          const sessionId = response.result.session_id;
          this.sessions.set(sessionId, {
            clientId,
            ...response.result
          });
          client.sessions.add(sessionId);
        }
      }
    } catch (error) {
      console.error('Error handling MCP message:', error);
      this.sendError(client.ws, message.id, -32603, 'Internal error');
    }
  }

  sendHandshake(ws) {
    const handshake = this.protocol.initialize();
    ws.send(JSON.stringify(handshake));
  }

  sendError(ws, id, code, message) {
    const errorResponse = this.protocol.createErrorResponse(id, code, message);
    ws.send(JSON.stringify(errorResponse));
  }

  // Broadcast message to all connected clients
  broadcast(message) {
    const data = JSON.stringify(message);
    
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    });
  }

  // Send message to specific client
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  // Send message to clients in a session
  sendToSession(sessionId, message) {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sendToClient(session.clientId, message);
    }
  }

  // Generate unique client ID
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup when client disconnects
  cleanupClient(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      // Clean up sessions
      client.sessions.forEach(sessionId => {
        this.sessions.delete(sessionId);
      });
      
      // Remove client
      this.clients.delete(clientId);
    }
  }

  // Get server statistics
  getStats() {
    return {
      connectedClients: this.clients.size,
      activeSessions: this.sessions.size,
      uptime: process.uptime(),
      protocolVersion: this.protocol.version
    };
  }

  // Streaming support for chat completions
  async streamChatCompletion(sessionId, params) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.error(`Session ${sessionId} not found`);
      return;
    }

    const { messages, model_type = 'online' } = params;
    
    try {
      const service = await aiService.getAIService(model_type === 'offline');
      const userMessage = messages[messages.length - 1].content;
      
      // Send stream start event
      this.sendToSession(sessionId, {
        id: null,
        jsonrpc: '2.0',
        method: 'stream/start',
        params: {
          session_id: sessionId,
          model_type
        }
      });

      // For demo purposes, we'll simulate streaming by chunking the response
      const response = await service.generateText(userMessage, messages.slice(0, -1));
      const chunks = this.chunkText(response, 10);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const isLast = i === chunks.length - 1;
        
        this.sendToSession(sessionId, {
          id: null,
          jsonrpc: '2.0',
          method: 'stream/chunk',
          params: {
            session_id: sessionId,
            chunk,
            index: i,
            finished: isLast
          }
        });
        
        // Add small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Send stream end event
      this.sendToSession(sessionId, {
        id: null,
        jsonrpc: '2.0',
        method: 'stream/end',
        params: {
          session_id: sessionId,
          total_chunks: chunks.length
        }
      });
      
    } catch (error) {
      console.error('Streaming error:', error);
      this.sendToSession(sessionId, {
        id: null,
        jsonrpc: '2.0',
        method: 'stream/error',
        params: {
          session_id: sessionId,
          error: error.message
        }
      });
    }
  }

  // Helper method to chunk text for streaming
  chunkText(text, chunkSize) {
    const words = text.split(' ');
    const chunks = [];
    
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' '));
    }
    
    return chunks;
  }
}

module.exports = MCPServer;