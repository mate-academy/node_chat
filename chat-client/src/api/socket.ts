

const WS_URL = import.meta.env.VITE_WS_URL ||  `ws://localhost:3005`;

export const ws = new WebSocket(WS_URL);


export function sendMessage(data: object) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  } else {
    ws.addEventListener('open', () => ws.send(JSON.stringify(data)), { once: true })
  }
}
