import { useEffect, useState } from 'react';
import { useLocalStorage } from './hooks';
import * as Types from './types';
import LoginModal from './components/LoginModal';
import Sidebar from './components/Sidebar/Sidebar';
import ChatArea from './components/ChatArea';
import { roomService } from './services/roomService';
import { messageService } from './services/messageService';

function App() {
  const [user, saveUser] = useLocalStorage<Types.User | null>('user');
  const [rooms, setRooms] = useState<Types.Room[]>([]);
  const [messages, setMessages] = useState<Types.Message[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Types.Room | null>(null);

  const handleAddRoom = (newRoom: Types.Room) => {
    setRooms((prev) => [...prev, newRoom]);
  };

  useEffect(() => {
    roomService.getAll().then(setRooms);
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      messageService.getAllByRoomId(selectedRoom.id).then(setMessages);
    }
  }, [selectedRoom]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row rounded-lg shadow-lg overflow-hidden bg-white w-[90vw] max-w-5xl h-[90vh]">
        <Sidebar
          user={user}
          rooms={rooms}
          selectedRoom={selectedRoom}
          onSelect={setSelectedRoom}
          onLogout={saveUser}
          onAddRoom={handleAddRoom}
        />
        <ChatArea
          user={user}
          selectedRoom={selectedRoom}
          messages={messages}
          setMessages={setMessages}
        />
      </div>

      {!user && <LoginModal onLogin={saveUser} />}
    </div>
  );
}

export default App;
