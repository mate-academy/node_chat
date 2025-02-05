import React, { useState, useEffect } from 'react';

const ChatApp = () => {
  const apiBaseUrl = 'http://localhost:3005';

  // Ініціалізація станів
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [roomName, setRoomName] = useState('');
  const [currentRoom, setCurrentRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // Збереження імені користувача
  const handleSaveUsername = () => {
    if (!username) {
      alert("Введіть ім'я!");
      return;
    }
    localStorage.setItem('username', username);
    alert("Ім'я збережено");
  };

  // Створення кімнати
  const handleCreateRoom = async () => {
    if (!roomName) {
      alert('Введіть назву кімнати!');
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName }),
      });

      if (res.ok) {
        setCurrentRoom(roomName);
        alert('Кімната створена');
      } else {
        const error = await res.text();
        alert(error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Приєднання до кімнати
  const handleJoinRoom = async () => {
    if (!roomName) {
      alert('Введіть назву кімнати!');
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/rooms/${roomName}`);

      if (res.ok) {
        setCurrentRoom(roomName);
        const msgs = await res.json();
        setMessages(msgs);
        alert('Ви приєдналися до кімнати');
      } else {
        const error = await res.text();
        alert(error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Надсилання повідомлення
  const handleSendMessage = async () => {
    if (!currentRoom) {
      alert('Спочатку приєднайтесь до кімнати!');
      return;
    }

    if (!message) {
      alert('Введіть повідомлення!');
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: currentRoom,
          author: username,
          text: message,
        }),
      });

      if (res.ok) {
        // Створюємо об'єкт повідомлення для локального оновлення
        const newMsg = {
          author: username,
          text: message,
          time: new Date().toISOString(),
        };

        setMessages((prevMessages) => [...prevMessages, newMsg]);
        setMessage('');
      } else {
        const error = await res.text();
        alert(error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Автоматичне оновлення повідомлень через useEffect (polling кожні 3 сек)
  useEffect(() => {
    let intervalId;
    if (currentRoom) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`${apiBaseUrl}/rooms/${currentRoom}`);
          if (res.ok) {
            const msgs = await res.json();
            setMessages(msgs);
          } else {
            console.error('Помилка при отриманні повідомлень');
          }
        } catch (err) {
          console.error(err);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentRoom]);

  return (
    <div id="app">
      <div className="container">
        <h1>Chat App</h1>
        <div className="username">
          <label htmlFor="username">Ваше ім'я:</label>
          <input
            type="text"
            id="username"
            placeholder="Введіть ім'я"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button id="save-username" onClick={handleSaveUsername}>
            Зберегти
          </button>
        </div>

        <div className="room">
          <label htmlFor="room-name">Назва кімнати:</label>
          <input
            type="text"
            id="room-name"
            placeholder="Введіть назву кімнати"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button id="create-room" onClick={handleCreateRoom}>
            Створити кімнату
          </button>
          <button id="join-room" onClick={handleJoinRoom}>
            Приєднатися
          </button>
        </div>

        <div id="chat">
          <div id="messages">
            {messages.map((msg, index) => (
              <div className="message" key={index}>
                <strong>{msg.author}</strong> [
                {new Date(msg.time).toLocaleTimeString()}]: {msg.text}
              </div>
            ))}
          </div>
          <div className="message-input">
            <input
              type="text"
              id="message"
              placeholder="Введіть повідомлення"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button id="send-message" onClick={handleSendMessage}>
              Надіслати
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
