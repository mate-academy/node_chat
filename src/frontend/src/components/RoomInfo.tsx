import { EllipsisVertical, Hash } from 'lucide-react';
import type { Room } from '../types/Room';

type Props = {
  currentRoom: Room | null;
}

export const RoomInfo: React.FC<Props> = ({ currentRoom }) => {
  const roomMembers = currentRoom?.users?.length || 1;

  if (!currentRoom) {
    return <div className="chat-room-info"></div>;
  }

  return (
    <div className="chat-room-info">
      <div className="room-info-name-container">
        <div className="room-info-name">
          <Hash size={15} />
          <span>
            <strong>{currentRoom?.name}</strong>
          </span>
        </div>
        <span>{roomMembers} members</span>
      </div>
      <EllipsisVertical size={15} />
    </div>
  );
};
