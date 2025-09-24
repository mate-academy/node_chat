import React, { useEffect, useState } from 'react';
import './App.css';
import Username from './Username';

type Message = {
  id: number,
  text: string,
  author: string,
  time: Date,
  roomId: number,
}

type Room = {
  id: number,
  name: string,
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [currentRoom, setCurrentRoom] = useState<number | null>(null);

  const [messageInputValue, setMessageInputValue] = useState<string>('');
  const [roomNameInputValue, setRoomNameInputValue] = useState<string>('');

  const [roomRenameInputValue, setRoomRenameInputValue] = useState<string>('');

  const [username, setUsername] =
    useState(localStorage.getItem('username') || '');

  const [socket, setSocket] = useState<WebSocket | null>(null);

  const handleMessageSend = () => {
    if (!username || !currentRoom) return;
    if (messageInputValue && socket) {
      const message = {
        text: messageInputValue,
        time: new Date(),
        author: username,
        roomId: currentRoom,
      };
      socket.send(JSON.stringify(message));
      setMessageInputValue('');
    }
  };

  const handleCreateRoom = () => {
    if (!roomNameInputValue) return;

    fetch('http://localhost:3005/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: roomNameInputValue }),
    })
      .then(response => response.json())
      .then(data => setRooms(prev => [data, ...prev]))
      .then(() => setRoomNameInputValue(''))
      .catch(error => console.log(error));
  }

  const handleRenameRoom = () => {
    if (!roomRenameInputValue) return;

    fetch(`http://localhost:3005/rooms/${currentRoom}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: roomRenameInputValue }),
    })
      .then(response => response.json())
      .then(data => {
        setRooms((prev) =>
          prev.map((room) =>
            room.id === data.id ? { ...room, name: data.name } : room
          )
        );
      })
      .then(() => {
        setRoomRenameInputValue('');
      })
      .catch(error => console.log(error));
  }

  const handleDeleteRoom = (id: number) => {
    if (id === currentRoom) {
      setCurrentRoom(null);
      setMessages([]);
    }

    fetch(`http://localhost:3005/messages/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(() => {
        setMessages(prev => prev.filter(message => message.roomId !== id));
      })
      .catch(error => console.log(error));

    fetch(`http://localhost:3005/rooms/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(() => {
        setRooms(prev => prev.filter(room => room.id !== id));
      })
      .catch(error => console.log(error));


  }

  const handleJoinRoom = (id: number) => {
    fetch(`http://localhost:3005/rooms/${id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Room not found or join failed');
        }
      })
      .then(data => {
        console.log('Room join confirmed:', data.message);
        setCurrentRoom(id);

        if (socket) {
          socket.send(JSON.stringify({
            type: 'join',
            roomId: id
          }));
        }

        return fetch(`http://localhost:3005/messages/${id}`);
      })
      .then(response => response.json())
      .then(data => setMessages(data.reverse()))
  }

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:3005');

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'history') {
        setMessages(data.messages);
        return;
      }

      if (data.type === 'join-success' || data.type === 'join-error') return;

      setMessages(prev => [data, ...prev]);
    };

    setSocket(newSocket);

    if (currentRoom) {
      newSocket.onopen = () => {
        newSocket.send(JSON.stringify({
          type: 'join',
          roomId: currentRoom
        }));
      };
    }

    return () => newSocket.close();
  }, [currentRoom]);

  useEffect(() => {
    fetch('http://localhost:3005/rooms')
      .then(response => response.json())
      .then(data => setRooms(data.reverse()))
      .catch(err => console.log(err))
  }, []);

  return (
    <div className="messager">
      <Username username={username} setUsername={setUsername} socket={socket} />
      <ul className="messages">
        {messages.map(message => (
          <li key={message.id}>
            <span>{message.text}</span>
            {` - FROM ${message.author} AT `}
            {new Date(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </li>
        ))}
      </ul>
      <div className="input">
        <input
          placeholder='Message'
          type="text"
          value={messageInputValue}
          onChange={(event) => setMessageInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleMessageSend();
            }
          }}
        />
        <button type="submit" onClick={handleMessageSend}>Send</button>
      </div>

      <div className="rooms">
        <p>Current room: {rooms.find(room => room.id === currentRoom)?.name}</p>
        <p>Rooms:</p>
        <div className="inputs">
          <div>
            <input
              placeholder='Name'
              type="text"
              value={roomNameInputValue}
              onChange={
                (event) => setRoomNameInputValue(event?.target.value)
              }
            />
            <button onClick={handleCreateRoom}>Create</button>
          </div>

          <div>
            <input
              placeholder='New name'
              type="text"
              value={roomRenameInputValue}
              onChange={
                (event) => setRoomRenameInputValue(event?.target.value)
              }
            />
            <button
              onClick={handleRenameRoom}
            >Rename</button>
          </div>
        </div>

        <ul className='roomsList'>
          {rooms.map((room) => (
            <li key={room.id} className='room'>
              <p className='roomName'>{room.name}</p>
              <button onClick={() => handleJoinRoom(room.id)}>Join</button>
              <button onClick={() => handleDeleteRoom(room.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
