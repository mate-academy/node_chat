import type { Room } from "../../types/room";
import './RoomsList.scss';
import { RoomItem } from "../RoomItem/RoomItem";

type Props = {
  rooms: Room[];
  name: string;
  onDeleteRoom: (roomId: string) => void;
  onRenameRoom: (roomId: string, newRoomName: string) => void;
};

export const RoomsList = ({ rooms, name, onDeleteRoom, onRenameRoom }: Props) => {
  return (
    rooms.length === 0 ? (
      <p className="roomsList__empty">No rooms available</p>
    ) : (
      <div className="roomsList">
        {rooms.map((room) => (
          <RoomItem key={room.roomId} room={room} name={name} onDeleteRoom={onDeleteRoom} onRenameRoom={onRenameRoom} />
        )
        )}
      </div>
    )
  );
};
