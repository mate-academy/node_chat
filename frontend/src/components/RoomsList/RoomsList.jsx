import { Room } from '../Room';
import styles from './RoomsList.module.scss';

export const RoomsList = ({
  rooms,
  selectedRoom,
  onSelectRoom,
  onDeleteRoom,
  onEditRoom,
}) => {
  return (
    <div className={styles.roomsList}>
      {rooms.map((room) => (
        <div key={room.id}>
          <Room
            roomName={room.name}
            isSelected={selectedRoom?.id === room.id}
            onSelect={() => onSelectRoom(room)}
            onDelete={() => onDeleteRoom(room)}
            onEdit={() => onEditRoom(room)}
          />
        </div>
      ))}
    </div>
  );
};
