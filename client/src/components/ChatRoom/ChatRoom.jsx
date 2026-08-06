import { useState, useEffect } from 'react';
import { socket } from '../../socket';

function ChatRoom({ onLeaveRoom }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    socket.on('messages list', (list) => setMessages(list));
    socket.on('new message', (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      socket.off('messages list');
      socket.off('new message');
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();

    const trimmed = text.trim();

    if (trimmed === '') {
      return;
    }

    socket.emit('send message', trimmed);
    setText('');
  };

  return (
    <div className="chat-room">
      <button className="leave-btn" onClick={onLeaveRoom}>
        ← Вийти з кімнати
      </button>

      <ul className="message-list">
        {messages.map((message) => (
          <li className="message-item" key={message.time}>
            <span className="time">
              {new Date(message.time).toLocaleTimeString()}
            </span>
            <span className="author">{message.author}: </span>
            {message.text}
          </li>
        ))}
      </ul>

      <form className="message-form" onSubmit={handleSend}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter new message"
        />
        <button type="submit">Надіслати</button>
      </form>
    </div>
  );
}

export default ChatRoom;
