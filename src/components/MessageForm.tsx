import { useState } from 'react';

export default function MessageForm({
  onSend,
}: {
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text.trim());
        setText('');
      }}
      style={{
        display: 'flex',
        gap: 8,
        padding: 12,
        borderTop: '1px solid #e5e7eb',
        background: '#fff',
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Digite uma mensagem…"
        style={{
          flex: 1,
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid #e5e7eb',
        }}
      />
      <button
        type="submit"
        style={{
          padding: '10px 14px',
          borderRadius: 8,
          border: '1px solid #10b981',
          background: '#10b981',
          color: 'white',
        }}
      >
        Enviar
      </button>
    </form>
  );
}
