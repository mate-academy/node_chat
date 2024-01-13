import { createRoom, getRooms } from '../../api';
import { Room } from './Room/Room';
import './Rooms.css';

export function Rooms({ rooms, setRoom, setRooms, setMessages }) {
  const handleCreateRoom = async () => {
    await createRoom();

    getRooms().then(res => {
      setRooms(res.data);
    });
  };

  return (
    <div>
      <button
        className="button is-info"
        onClick={handleCreateRoom}
      >
        Create
      </button>
      <ul className="rooms">
        {rooms.map(room => (
          <Room
            room={room}
            setRoom={setRoom}
            setRooms={setRooms}
            setMessages={setMessages}
            key={room.id}
          />
        ))}
      </ul>
    </div>
  );
}
