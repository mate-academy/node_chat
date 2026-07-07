import { RoomCard } from './RoomCard';
import type { Room } from '../types';

type Props = {
  rooms: Room[];
  onRoomChanged: () => void;
};

export const RoomList = ({ rooms, onRoomChanged }: Props) => {
  if (rooms.length === 0) {
    return <p style={{ color: '#666' }}>Кімнат поки немає.</p>;
  }

  return (
    <div style={{ marginTop: '20px' }}>
      {rooms.map((room) => (
        <RoomCard
          key={room._id || room._id}
          room={room}
          onRoomChanged={onRoomChanged}
        />
      ))}
    </div>
  );
};
