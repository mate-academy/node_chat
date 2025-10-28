/* global React, ReactDOM */
const { useState, useEffect, useRef } = React;

function App() {
  const [username, setUsername] = useState(
    localStorage.getItem('username') || '',
  );

  const [isUserNameSet, setIsUserNameSet] = useState(
    !!localStorage.getItem('username'),
  );

  const [currentRoom, setCurrentRoom] = useState('General');
  const [rooms, setRooms] = useState(['General']);
  const [messages, setMessages] = useState({ General: [] });
  const [newMessage, setNewMessage] = useState('');
  const wsRef = useRef(null);

  const handleUserName = () => {
    if (username.trim() !== '') {
      localStorage.setItem('username', username);
      setIsUserNameSet(true);
    }
  };

  useEffect(() => {
    if (!username) {
      return;
    }

    fetch('/rooms')
      .then((res) => res.json())
      .then((roomList) => {
        setRooms(roomList);

        if (!roomList.includes(currentRoom)) {
          setCurrentRoom('General');
        }

        const initialMessages = {};

        roomList.forEach((r) => {
          initialMessages[r] = [];
        });
        setMessages(initialMessages);
      });
  }, [username]);

  useEffect(() => {
    if (!username) {
      return;
    }

    if (!currentRoom) {
      return;
    }

    fetch(`/messages?room=${currentRoom}`)
      .then((res) => res.json())
      .then((msgs) => {
        setMessages((prev) => ({ ...prev, [currentRoom]: msgs }));
      });

    const evtSource = new EventSource(`/messages/stream?room=${currentRoom}`);
    const onMessage = (e) => {
      const message = JSON.parse(e.data);

      setMessages((prev) => {
        const roomMessages = prev[message.room] || [];

        if (
          roomMessages.some(
            (m) =>
              m.date === message.date &&
              m.text === message.text &&
              m.author === message.author,
          )
        ) {
          return prev;
        }

        return { ...prev, [message.room]: [...roomMessages, message] };
      });
    };

    evtSource.addEventListener('message', onMessage);

    return () => {
      evtSource.removeEventListener('message', onMessage);
      evtSource.close();
    };
  }, [username, currentRoom]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') {
      return;
    }

    await fetch('/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: newMessage,
        author: username,
        room: currentRoom,
      }),
    });
    setNewMessage('');
  };

  const createRoom = async () => {
    const roomName = prompt('Enter new room name:');

    if (!roomName || rooms.includes(roomName)) {
      return;
    }

    await fetch('/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName }),
    });
    setRooms((prev) => [...prev, roomName]);
    setCurrentRoom(roomName);
    setMessages((prev) => ({ ...prev, [roomName]: [] }));
  };

  const renameRoom = async (oldName) => {
    const newName = prompt('Enter new room name:', oldName);

    if (!newName || rooms.includes(newName)) {
      return;
    }

    await fetch('/rooms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldName, newName }),
    });
    setRooms((prev) => prev.map((r) => (r === oldName ? newName : r)));

    setMessages((prev) => {
      const { [oldName]: oldMsgs, ...rest } = prev;

      return { ...rest, [newName]: oldMsgs };
    });

    if (currentRoom === oldName) {
      setCurrentRoom(newName);
    }
  };

  const deleteRoom = async (roomName) => {
    if (roomName === 'General') {
      alert('Cannot delete General');

      return;
    }

    if (!confirm(`Delete room "${roomName}"?`)) {
      return;
    }

    await fetch('/rooms', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName }),
    });

    setRooms((prev) => prev.filter((r) => r !== roomName));

    setMessages((prev) => {
      const { [roomName]: _, ...rest } = prev;

      return rest;
    });

    if (currentRoom === roomName) {
      setCurrentRoom('General');
    }
  };

  const joinRoom = (roomName) => {
    setCurrentRoom(roomName);
  };

  return (
    <div className="chat-container">
      {!isUserNameSet ? (
        <div className="username-form">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleUserName}>Set Username</button>
        </div>
      ) : (
        <div className="main-content">
          <div className="rooms">
            <h3>Rooms:</h3>
            {rooms.map((room) => (
              <div
                key={room}
                className={`room-item ${currentRoom === room ? 'active' : ''}`}
              >
                <span className="room-name">{room}</span>
                <div className="room-buttons">
                  <button
                    onClick={() => joinRoom(room)}
                    disabled={currentRoom === room}
                  >
                    Join
                  </button>
                  <button onClick={() => renameRoom(room)}>Rename</button>
                  <button onClick={() => deleteRoom(room)}>Delete</button>
                </div>
              </div>
            ))}
            <button onClick={createRoom} className="create-room-btn">
              + New Room
            </button>
          </div>

          <div className="chat">
            <h3>Room: {currentRoom}</h3>
            <div className="messages">
              {(messages[currentRoom] || []).map((msg, i) => (
                <div key={i} className="message">
                  <div className="message-content">
                    <span className="author">{msg.author}:</span>
                    <span className="text">{msg.text}</span>
                  </div>
                  <div className="message-time">
                    {new Date(msg.date).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="send-form">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage();
                  }
                }}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
