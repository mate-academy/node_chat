import type { Room } from "../../types/Room"
import { RoomItem } from "./RoomItem"
import './Rooms.scss';

type Props = {
  rooms: Room[];
  userId: string
  onOpen: (isOpen: boolean) => void;
  onDelete: (roomId: string) => void;
  onUpdate: (room: Room) => void;
}

export const RoomList: React.FC<Props> = ({ rooms, userId, onOpen, onUpdate, onDelete }) => {
  return (
    <ul className="roomList">
      <button className="roomList__createBtn" onClick={() => onOpen(true)}>Create</button>
      {rooms.map(room => (
        <li key={room.id} className="roomList__item">
          <RoomItem
          room={room}
          userId={userId}
          onUpdate={onUpdate}
          onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  )
}
