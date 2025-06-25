const { v4: uuidv4 } = require('uuid');

class MCPProtocol {
  constructor() {
    this.version = '1.0.0';
    this.serverName = 'native-ai-mcp-server';
    this.capabilities = {
      chat: true,
      streaming: true,
      context_management: true,
      model_switching: true,
      offline_models: true
    };
  }

  // Initialize MCP handshake
  initialize(clientInfo) {
    return {
      id: uuidv4(),
      jsonrpc: '2.0',
      method: 'initialize',
      result: {
        protocolVersion: this.version,
        serverName: this.serverName,
        capabilities: this.capabilities,
        serverInfo: {
          name: this.serverName,
          version: this.version,
          description: 'Native AI Chat MCP Server with online/offline model support'
        }
      }
    };
  }

  // Handle incoming MCP messages
  async handleMessage(message, context) {
    try {
      const { method, params, id } = message;

      switch (method) {
        case 'initialize':
          return this.handleInitialize(params, id);
        
        case 'chat/completions':
          return await this.handleChatCompletion(params, id, context);
        
        case 'model/switch':
          return await this.handleModelSwitch(params, id, context);
        
        case 'context/update':
          return this.handleContextUpdate(params, id, context);
        
        case 'session/create':
          return this.handleSessionCreate(params, id);
        
        case 'session/destroy':
          return this.handleSessionDestroy(params, id);
        
        default:
          return this.createErrorResponse(id, -32601, `Method not found: ${method}`);
      }
    } catch (error) {
      console.error('MCP Protocol Error:', error);
      return this.createErrorResponse(message.id, -32603, 'Internal error');
    }
  }

  // Handle initialization request
  handleInitialize(params, id) {
    return {
      id,
      jsonrpc: '2.0',
      result: {
        protocolVersion: this.version,
        serverInfo: {
          name: this.serverName,
          version: this.version,
          capabilities: this.capabilities
        }
      }
    };
  }

  // Handle chat completion request
  async handleChatCompletion(params, id, context) {
    const { messages, model_type = 'online', stream = false, session_id } = params;
    
    try {
      const aiService = context.aiService;
      const service = await aiService.getAIService(model_type === 'offline');
      
      // Extract the latest user message
      const userMessage = messages[messages.length - 1].content;
      
      // Generate response
      const response = await service.generateText(userMessage, messages.slice(0, -1));
      
      if (stream) {
        // For streaming, we'll implement Server-Sent Events
        return {
          id,
          jsonrpc: '2.0',
          result: {
            type: 'stream_start',
            session_id,
            model_type
          }
        };
      } else {
        return {
          id,
          jsonrpc: '2.0',
          result: {
            choices: [{
              message: {
                role: 'assistant',
                content: response
              },
              finish_reason: 'stop'
            }],
            model: model_type,
            usage: {
              prompt_tokens: this.estimateTokens(userMessage),
              completion_tokens: this.estimateTokens(response),
              total_tokens: this.estimateTokens(userMessage + response)
            }
          }
        };
      }
    } catch (error) {
      console.error('Chat completion error:', error);
      return this.createErrorResponse(id, -32000, `Chat completion failed: ${error.message}`);
    }
  }

  // Handle model switching
  async handleModelSwitch(params, id, context) {
    const { model_type, session_id } = params;
    
    try {
      const aiService = context.aiService;
      const service = await aiService.getAIService(model_type === 'offline');
      
      // Check if offline model is available
      if (model_type === 'offline') {
        const isAvailable = await aiService.isModelDownloaded();
        if (!isAvailable) {
          return this.createErrorResponse(id, -32001, 'Offline model not available');
        }
      }
      
      return {
        id,
        jsonrpc: '2.0',
        result: {
          success: true,
          model_type,
          session_id,
          message: `Switched to ${model_type} model`
        }
      };
    } catch (error) {
      return this.createErrorResponse(id, -32000, `Model switch failed: ${error.message}`);
    }
  }

  // Handle context update
  handleContextUpdate(params, id, context) {
    const { session_id, context_data } = params;
    
    // Store context data for session
    if (!context.sessions) {
      context.sessions = {};
    }
    
    context.sessions[session_id] = {
      ...context.sessions[session_id],
      context: context_data,
      updated_at: new Date().toISOString()
    };
    
    return {
      id,
      jsonrpc: '2.0',
      result: {
        success: true,
        session_id,
        message: 'Context updated successfully'
      }
    };
  }

  // Handle session creation
  handleSessionCreate(params, id) {
    const session_id = uuidv4();
    const { user_id, model_type = 'online' } = params;
    
    return {
      id,
      jsonrpc: '2.0',
      result: {
        session_id,
        user_id,
        model_type,
        created_at: new Date().toISOString(),
        status: 'active'
      }
    };
  }

  // Handle session destruction
  handleSessionDestroy(params, id) {
    const { session_id } = params;
    
    return {
      id,
      jsonrpc: '2.0',
      result: {
        success: true,
        session_id,
        message: 'Session destroyed successfully'
      }
    };
  }

  // Create error response
  createErrorResponse(id, code, message) {
    return {
      id,
      jsonrpc: '2.0',
      error: {
        code,
        message,
        data: {
          timestamp: new Date().toISOString()
        }
      }
    };
  }

  // Estimate tokens (simple approximation)
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  // Validate MCP message format
  validateMessage(message) {
    const required = ['jsonrpc', 'method', 'id'];
    return required.every(field => message.hasOwnProperty(field));
  }
}

module.exports = MCPProtocol;