import { useState } from 'react';
import './Chat.css';

function Chat({ username, messages, onSend }) {
  const [text, setText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();

    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <div className='chat'>
      <h2>💬 Вітаємо, {username}!</h2>
      <div className='messages'>
        {messages.map((msg) => (
          <div className='message' key={msg.id}>
            <strong>{msg.author}:</strong> {msg.text}
            <span className='timestamp'>{new Date(msg.time).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      <form className='send_form' onSubmit={handleSend}>
        <input
          type='text'
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Напиши щось...'
        />
        <button type='submit'>📨</button>
      </form>
    </div>
  );
}

export default Chat;
