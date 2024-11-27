
import { useEffect, useState } from 'react';
import './App.css';
import { ChatRoom } from './ChatRoom';

export function App() {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [socket, setSocket] = useState(null);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [roomName, setRoomName] = useState('');

  const createRoom = async () => {
    if (!roomName || roomName.trim() === '') {
      setErrorMessage('Room name cannot be empty');
      return;
    }

    try {
      const response = await fetch('http://localhost:3005/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName }),
      });

      const data = await response.json();
      setAvailableRooms((prev) => {
        const isRoomAlreadyExists = prev.some((room) => room.roomId === data.roomId);
        if (!isRoomAlreadyExists) {
          return [...prev, data];
        }
        return prev;
      });
      setRoomName('');
      setRoomId(data.roomId);
      setErrorMessage('');
    } catch (err) {
      console.error("Failed to create room:", err);
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('http://localhost:3005/rooms');
        const data = await response.json();
        setAvailableRooms(data);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchConnectionsCount = async () => {
      try {
        const response = await fetch('http://localhost:3005/connections-count');
        const data = await response.json();
        setConnectionsCount(data.connectionsCount);
      } catch (error) {
        console.error('Failed to fetch connections count:', error);
      }
    };

    fetchConnectionsCount();

    const interval = setInterval(fetchConnectionsCount, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      console.log('Opening new WebSocket connection');
      const ws = new WebSocket('ws://localhost:3005');
      setSocket(ws);

      ws.onopen = () => console.log('WebSocket connected');

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);

        if (response.error) {
          setErrorMessage(response.error);
          console.error('Server error:', response.error);
          return;
        }

        if (response.newRoom) {
          setAvailableRooms((prev) => {
            const exists = prev.some((room) => room.roomId === response.newRoom.roomId);
            if (!exists) {
              return [...prev, response.newRoom];
            }
            return prev;
          });
        }
      };
      ws.onclose = () => console.log('WebSocket closed');

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (roomId && availableRooms.length > 0) {
      const selectedRoom = availableRooms.find(room => room.roomId === roomId);
      if (selectedRoom) {
        setRoomName(selectedRoom.roomName);
      }
    }
  }, [roomId, availableRooms]);

  useEffect(() => {
    if (socket && roomId) {
      socket.send(JSON.stringify({ action: 'joinRoom', roomId }));
    }
  }, [roomId, socket]);

  return (
    <div className="App">
      <div>
        <h1 className='title'>Chat App</h1>
        <div className='main'>
          <div className='name'>
            <input
              type="text"
              id="name-input"
              className='name-input'
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your name"
              />
          </div>
            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
          )}
          <div className="room-selector" onChange={(event) => setRoomId(event.target.value)}>
            {/* <h3 className='name'>Select a Room</h3> */}
            <ul>
              {availableRooms.map((room) => (
                <li key={room.roomId}>
                <button className="room-button"
                  onClick={() => setRoomId(room.roomId)}
                  style={{
                    backgroundColor: room.roomId === roomId ? 'white' : '#ebebeb',
                  }}
                >
                  {room.roomName}
                </button>
              </li>
              ))}
            </ul>
          </div>
          <div className="create-room">
            <input className="create-room-input"
              type="text"
              placeholder="New room name"
              onChange={(e) => setRoomName(e.target.value)}
            />
            <button className="create-room-button" onClick={createRoom}>Create Room</button>
          </div>
          {roomId && <ChatRoom roomId={roomId} roomName={roomName} username={username} socket={socket} />}
        </div>
          <h3 className='users-total' id='users-total'>Total users: {connectionsCount}</h3>
      </div>
    </div>
  );
}

export default App;
