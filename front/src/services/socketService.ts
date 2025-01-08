// import { WSMessage } from "../types/types";

export const socket = new WebSocket('ws://localhost:5000');

// export const socketService = {
//   onMessageReceived: (callback: (message: WSMessage) => void) => {
//     socket.onmessage = (event) => {
//       const message = JSON.parse(event.data) as WSMessage;
//       callback(message);
//     };
//   },
// };
