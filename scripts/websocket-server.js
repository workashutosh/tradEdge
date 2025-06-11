const WebSocket = require('ws');

const PORT = 9090;
const wss = new WebSocket.Server({ port: PORT, host: '192.168.1.20' });

console.log(`WebSocket server started on ws://192.168.1.20:${PORT}`);



wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);

    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Send a welcome message to the newly connected client
  ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));
});
