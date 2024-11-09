// ws-client.js
const io = require('socket.io-client');
const socket = io('http://localhost:8080/status?userId=4');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('connect_error', (err) => {
  console.error('Connection error:', err.message);
});
