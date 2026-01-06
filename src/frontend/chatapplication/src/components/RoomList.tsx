import { Socket } from 'socket.io-client';

interface RoomListProps {
  rooms: string[];
  currentRoom: string;
  setCurrentRoom: (room: string) => void;
  socket: Socket;
}

export default function RoomList({ rooms, currentRoom, setCurrentRoom, socket }: RoomListProps) {
  const createRoom = () => {
    const name = prompt('Nome da nova sala:');
    if (name) socket.emit('createRoom', name);
  };

  return (
    <div>
      <h3>Salas</h3>
      <button onClick={createRoom}>Criar Sala</button>
      <ul>
        {rooms.map((room) => (
          <li key={room}>
            <button
              onClick={() => setCurrentRoom(room)}
              style={{ fontWeight: room === currentRoom ? 'bold' : 'normal' }}
            >
              {room}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
