import { useEffect, useState } from 'react';
import { AuthForm } from './components/AuthForm.js';
import { SidebarRooms } from './components/SidebarRooms.js';
import { ChatPanel } from './components/ChatPanel.js';

const socket = new WebSocket('ws://localhost:3005');

const App = () => {
  const storedNickname = localStorage.getItem('nickname') || '';
  const [chatHistory, setChatHistory] = useState([]);
  const [nickname, setNickname] = useState(storedNickname);
  const [canModify, setCanModify] = useState(false);
  const [activeRoom, setActiveRoom] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);

  useEffect(() => {
    socket.onmessage = ({ data }) => {
      const { type, payload } = JSON.parse(data);

      switch (type) {
        case 'history':
          setChatHistory(payload);
          break;

        case 'rooms-updated':
          setAvailableRooms(payload);
          break;

        case 'user-rights':
          setCanModify(payload);
          break;

        case 'message-received':
          setChatHistory((prev) => [...prev, payload]);
          break;

        default:
          console.warn('Unknown event:', type);
      }
    };
  }, []);

  useEffect(() => {
    safeSend({ type: 'list-rooms' });

    if (activeRoom && nickname) {
      safeSend({
        type: 'join-room',
        payload: { room: activeRoom, username: nickname },
      });

      safeSend({
        type: 'verify-rights',
        payload: { room: activeRoom, username: nickname },
      });
    }
  }, [nickname, activeRoom]);

  const safeSend = (data) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else {
    socket.addEventListener(
      'open',
      () => {
        socket.send(JSON.stringify(data));
      },
      { once: true }
    );
  }
}

  const handleRoomCreate = (newRoomTitle) => {
    safeSend({
      type: 'add-room',
      payload: { name: newRoomTitle, username: nickname },
    });
  };

  return (
    <>
      {!storedNickname ? (
        <AuthForm onLogin={setNickname} />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto px-6 py-4">
          <SidebarRooms
            availableRooms={availableRooms}
            activeRoom={activeRoom}
            onRoomSelect={setActiveRoom}
            onCreateRoom={handleRoomCreate}
          />
          {activeRoom ? (
            <ChatPanel
              currentRoom={activeRoom}
              canEdit={canModify}
              chatLog={chatHistory}
              socket={socket}
              clearSelectedRoom={setActiveRoom}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600 text-lg">
              <p>Choose a room to start chatting</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default App;
