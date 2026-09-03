import { useEffect, useState } from 'react';
import { api } from './api/client';
import { useRealtime } from './hooks/useRealtime';
import { Login } from './components/Login';
import { RoomList } from './components/RoomList';
import { ChatRoom } from './components/ChatRoom';

function App() {
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!username) {
      return;
    }

    api.getRooms().then((data) => {
      setRooms(data);
      setCurrentRoomId((prev) => {
        if (prev) {
          return prev;
        }

        const general = data.find((room) => room.name === 'general');

        return (general || data[0])?.id ?? null;
      });
    });
  }, [username]);

  useEffect(() => {
    if (!currentRoomId) {
      setMessages([]);

      return;
    }

    api.getMessages(currentRoomId).then(setMessages);
  }, [currentRoomId]);

  function handleRealtimeEvent(event, payload) {
    switch (event) {
      case 'room:created':
        setRooms((prev) => [...prev, payload]);
        break;

      case 'room:updated':
        setRooms((prev) => prev.map((room) => (room.id === payload.id ? payload : room)));
        break;

      case 'room:deleted':
        setRooms((prev) => prev.filter((room) => room.id !== payload.id));
        setCurrentRoomId((prev) => {
          if (prev !== payload.id) {
            return prev;
          }

          const remaining = rooms.filter((room) => room.id !== payload.id);

          return remaining[0]?.id ?? null;
        });
        break;

      case 'message:created':
        if (payload.roomId === currentRoomId) {
          setMessages((prev) => [...prev, payload]);
        }

        break;

      default:
        break;
    }
  }

  useRealtime(Boolean(username), handleRealtimeEvent);

  if (!username) {
    return (
      <Login
        onLogin={(name) => {
          localStorage.setItem('username', name);
          setUsername(name);
        }}
      />
    );
  }

  const currentRoom = rooms.find((room) => room.id === currentRoomId) || null;

  return (
    <div className="chat-screen">
      <RoomList
        rooms={rooms}
        currentRoomId={currentRoomId}
        onSelect={setCurrentRoomId}
        onCreate={(name) => api.createRoom(name).catch((error) => window.alert(error.message))}
        onRename={(id, name) =>
          api.renameRoom(id, name).catch((error) => window.alert(error.message))
        }
        onDelete={(id) => api.deleteRoom(id).catch((error) => window.alert(error.message))}
      />
      <ChatRoom
        room={currentRoom}
        messages={messages}
        username={username}
        onSend={(text) =>
          api.createMessage(currentRoomId, username, text).catch((error) => window.alert(error.message))
        }
      />
    </div>
  );
}

export default App;
