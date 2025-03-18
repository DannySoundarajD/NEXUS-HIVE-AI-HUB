// websocket/socket.js
const ollamaService = require('../services/ollamaService');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Handle chat messages
    socket.on('chat-message', async (data) => {
      try {
        const { message, conversationHistory } = data;
        
        // Acknowledge receipt of message
        socket.emit('message-received', { id: data.id });
        
        // Format conversation history for context if provided
        let prompt = message;
        if (conversationHistory && conversationHistory.length > 0) {
          prompt = conversationHistory.map(msg => 
            `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
          ).join('\n') + `\nUser: ${message}\nAssistant:`;
        }
        
        // Generate response
        const response = await ollamaService.generateText(prompt);
        
        // Send response back to client
        socket.emit('chat-response', {
          id: data.id,
          response: response
        });
      } catch (error) {
        console.error('Error processing chat message via WebSocket:', error);
        socket.emit('error', { 
          id: data.id,
          error: 'Failed to process message' 
        });
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};