import { FC } from "react";
import { Room } from "../../types/room";
import { Avatar } from "../avatar";
import cn from "classnames";

import "./rooms-list.scss";

type RoomsListProps = {
  rooms: Room[];
  currentRoomId?: Room["id"] | null;
  onSelect: (room: Room) => void;
  onExitRoomClick: () => void;
};

export const RoomsList: FC<RoomsListProps> = ({
  rooms,
  currentRoomId,
  onSelect,
  onExitRoomClick,
}) => {
  const handleExitRoom = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    onExitRoomClick();
  };

  return (
    <div className="rooms">
      {rooms.map((room) => {
        const { id, name, color } = room;
        return (
          <div
            className={cn("room", {
              "room--active": id === currentRoomId,
            })}
            onClick={() => onSelect(room)}
            key={id}
          >
            <Avatar name={name} backgroundColor={color} />
            {name}
            {currentRoomId === id && (
              <button className="room__exit" onClick={handleExitRoom}>
                Exit
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
