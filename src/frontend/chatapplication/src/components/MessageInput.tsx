import { useState } from 'react';

interface MessageInputProps {
  sendMessage: (text: string) => void;
}

export default function MessageInput({ sendMessage }: MessageInputProps) {
  const [text, setText] = useState<string>('');

  const handleSend = () => {
    if (text.trim()) {
      sendMessage(text);
      setText('');
    }
  };

  return (
    <div className="message-input">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Digite sua mensagem..."
      />
      <button onClick={handleSend}>Enviar</button>
    </div>
  );
}
