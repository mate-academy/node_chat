import type { Room } from '../types';

type Props = {
  rooms: Room[];
  currentId: string;
  onSelect: (id: string) => void;
};

export const RoomList = ({ rooms, currentId, onSelect }: Props) => {
  return (
    <ul>
      {rooms.map((room) => (
        <li key={room.id}>
          <button
            disabled={room.id === currentId}
            onClick={() => onSelect(room.id)}
          >
            {room.name}
          </button>
          <p>{room.name}</p>
        </li>
      ))}
    </ul>
  );
};
