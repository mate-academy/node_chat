export const socket = new WebSocket('ws://localhost:3005');

socket.addEventListener('open', () => {
  console.log('WebSocket connected');
});

socket.addEventListener('error', (error) => {
  console.log('WebSocket error:', error);
});

socket.addEventListener('close', (event) => {
  console.log('WebSocket closed:', event.code, event.reason);
});