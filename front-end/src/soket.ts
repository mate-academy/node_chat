import type { Message } from "./types/Message";

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

export const joinChat = (chatId: string) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        event: "joinChat",
        chatId,
      }),
    );
  }
};

export const onMessage = (
  callback: (message: Message) => void,
) => {
  const handleMessage = (event: MessageEvent) => {
    const message: Message = JSON.parse(event.data);
    callback(message);
  };

  socket.addEventListener("message", handleMessage);

  return () => {
    socket.removeEventListener("message", handleMessage);
  };
};