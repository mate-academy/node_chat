import type React from "react";
import type { Room } from "../types/room";

type Props = {
  room: Room;
};

export const RoomItem: React.FC<Props> = ({ room }) => {
  return <li>{room.name}</li>;
};
