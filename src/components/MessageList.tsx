import { useEffect, useRef } from 'react';
import type { Message } from '../App';

export default function MessageList({
  messages,
  loading,
}: {
  messages: Message[];
  loading: boolean;
}) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div
      style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#f9fafb' }}
    >
      {loading && (
        <div style={{ marginBottom: 12, color: '#6b7280' }}>
          Carregando mensagens…
        </div>
      )}

      {messages.map((m) => (
        <div key={m.id} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            <strong>{m.author}</strong> • {new Date(m.time).toLocaleString()}
          </div>
          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '8px 10px',
            }}
          >
            {m.text}
          </div>
        </div>
      ))}

      <div ref={endRef} />
    </div>
  );
}
