import React, { useState, useEffect } from 'react';
import ModalForm from './components/ModalForm';
import RoomList from './components/RoomList';
import ChatRoom from './components/ChatRoom';
import { Message, Room, socket } from './websocket';

export const App: React.FC = () => {
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem('username'),
  );
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomList, setRoomList] = useState<Room[]>([]);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [isCreate, setIsCreate] = useState<boolean>(false);

  useEffect(() => {
    socket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    socket.onmessage = event => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'room_list':
          setRoomList(data.rooms);
          break;

        case 'message':
          setChatLog(prevChatLog => [...prevChatLog, data]);
          break;

        case 'join_room':
          setChatLog(data.messages);
          console.log(`${data.user} joined the room`);
          break;

        case 'create_room':
          setIsCreate(false);
          setRoomList(data.rooms);
          break;

        case 'rename_room':
          setRoomList(data.rooms);
          console.log(data.renamedRoom);
          setSelectedRoom(data.renamedRoom);
          break;

        case 'delete_room':
          setRoomList(data.rooms);
          setSelectedRoom(null);
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    };

    socket.onclose = () => {
      console.log('Connection is break, try reload page');
    };

    socket.onerror = () => {
      console.log('Error conection, try reload page');
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleRegister = (userName: string) => {
    setUsername(userName);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    setUsername(null);
    setSelectedRoom(null);
  };

  const handleRoomCreate = (input: string) => {
    console.log(input);
    socket.send(JSON.stringify({ type: 'create_room', roomName: input }));
  };

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    socket.send(
      JSON.stringify({ type: 'join_room', user: username, roomId: room.id }),
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-500 text-white py-4 text-center">
        <h1 className="text-2xl">Simple Chat</h1>
      </header>
      <main className="flex flex-grow">
        {!username && (
          <div className="flex-grow bg-white p-4">
            <ModalForm onSubmit={handleRegister} buttonText="Register" />
          </div>
        )}
        {isCreate && (
          <div className="flex-grow bg-white p-4">
            <ModalForm
              onSubmit={handleRoomCreate}
              buttonText="Create new room"
            />
          </div>
        )}
        {username && !isCreate && (
          <>
            <aside className="bg-gray-200 p-4 w-1/4">
              <div className="flex justify-between">
                <button
                  type="button"
                  className="bg-blue-500 text-white py-2 px-4 rounded"
                  onClick={handleLogout}
                >
                  Logout
                </button>
                <button
                  type="button"
                  className="bg-blue-500 text-white py-2 px-4 rounded"
                  onClick={() => setIsCreate(true)}
                >
                  Create room
                </button>
              </div>
              <RoomList rooms={roomList} onSelectRoom={handleSelectRoom} />
            </aside>
            <section className="flex-grow p-4">
              {selectedRoom ? (
                <ChatRoom room={selectedRoom} chatLog={chatLog} />
              ) : (
                <div className="text-center">Select a room</div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};
