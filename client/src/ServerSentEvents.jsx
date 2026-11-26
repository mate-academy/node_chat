import { useEffect } from 'react';

const API_URL = 'http://127.0.0.1:5001';

export function ServerSentEventsLoader({ username, onData, onSender }) {
  useEffect(() => {
    const id = window.crypto.randomUUID();

    const send = (payload) => fetch(`${API_URL}/send?id=${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => undefined);

    const source = new EventSource(`${API_URL}/events?id=${id}`);

    source.onopen = () => {
      onSender(send);
      send({ type: 'login', username });
    };

    source.onmessage = (event) => onData(JSON.parse(event.data));

    return () => source.close();
  }, [username, onData, onSender]);

  return <h1 className="title">Chat application (SSE)</h1>;
}