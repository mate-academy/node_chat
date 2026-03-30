import { useEffect, useRef, useState } from 'react';
import './App.css';
import { Auth } from './components/Auth.js';
import { ActionType, type Room } from './types/types.js';
import { ChatArea } from './components/ChatArea.js';
import { RoomList } from './components/RoomList.js';

function App() {
  const [rooms, setRooms] = useState<{ [key: string]: Room }>({});
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const sendWsMessage = (type: ActionType, payload: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }));
    }
  };

  const handleSendMessage = (text: string) => {
    if (!currentRoomId || !username) return;

    sendWsMessage(ActionType.ADD_MESSAGE, {
      roomId: currentRoomId,
      message: {
        author: username,
        text,
      },
    });
  };

  const handleCreateRoom = (name: string) => {
    sendWsMessage(ActionType.CREATE_ROOM, name);
  };

  const handleDeleteRoom = (roomId: string) => {
    sendWsMessage(ActionType.DELETE_ROOM, { roomId });

    if (currentRoomId === roomId) {
      setCurrentRoomId(null);
    }
  };

  const handleRenameRoom = (roomId: string, name: string) => {
    sendWsMessage(ActionType.RENAME_ROOM, { roomId, name });
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    setUsername(null);
    setCurrentRoomId(null);
  };

  useEffect(() => {
    if (!username) {
      return;
    }

    const socket = new WebSocket(`ws://${window.location.hostname}:3005`);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: ActionType.GET_ROOMS }));
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (Object.values(ActionType).includes(message.type)) {
          setRooms(message.payload);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    return () => {
      socket.close();
    };
  }, [username]);

  if (!username) {
    return <Auth onLogin={setUsername} />;
  }

  return (
    <div className="app-layout">
      <RoomList
        rooms={rooms}
        currentRoomId={currentRoomId}
        onSelect={setCurrentRoomId}
        onDelete={handleDeleteRoom}
        onRename={handleRenameRoom}
        onCreateRoom={handleCreateRoom}
        onLogout={handleLogout}
      />

      <div className="chat-layout">
        {currentRoomId && rooms[currentRoomId] ? (
          <ChatArea
            room={rooms[currentRoomId]}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="empty-state">
            <h2>Choose a room on the left or create a new one</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
