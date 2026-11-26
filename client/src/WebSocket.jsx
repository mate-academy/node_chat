import { useEffect } from 'react';

const WS_URL = 'ws://127.0.0.1:5001';

export function WebSocketLoader({ username, onData, onSender }) {
  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    const send = (payload) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
      }
    };

    ws.onopen = () => {
      onSender(send);
      send({ type: 'login', username });
    };

    ws.onmessage = (event) => onData(JSON.parse(event.data));

    return () => ws.close();
  }, [username, onData, onSender]);

  return <h1 className="title">Chat application (WebSocket)</h1>;
}