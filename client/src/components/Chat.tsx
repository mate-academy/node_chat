import { useEffect, useState } from "react";

interface Message {
  author: string;
  text: string;
}

interface ChatProps {
  roomId: string;
}

export function Chat({ roomId }: ChatProps) {
  const username = localStorage.getItem('username') || 'Romanchyk';
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/rooms/${roomId}/messages`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);
      });

    const socket = new WebSocket('ws://localhost:5000');
    socket.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      if (parsedData.roomId === roomId) {
        setMessages((prevMessages) => [...prevMessages, parsedData]);
      }
    };
    setWs(socket);
    return () => socket.close();
  }, []);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (ws) {
      const messageData = JSON.stringify({
        roomId,
        author: username,
        text,
      });

      ws.send(messageData);
    }

    setText('');
  }

  return (
    <section id="center" className="mt">
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <b>{msg.author}:</b> {msg.text}
          </div>
        ))}
        {messages.length === 0
          && <p className="mt">Повідомлень поки немає...</p>}
      </div>
      <div className="mt">
        <form onSubmit={handleSendMessage}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Напиши щось, ${username}...`}
          />
          <button
            type="submit"
            className="counter ml"
          >
            Надіслати
          </button>
        </form>
      </div>
    </section>
  )
}
