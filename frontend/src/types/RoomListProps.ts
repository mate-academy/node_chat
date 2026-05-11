export interface Room {
  id: number;
  name: string;
  owner: string;
}

export interface RoomListProps {
  username: string;
  rooms: Room[];
  newRoomName: string;
  setNewRoomName: (name: string) => void;
  handleCreateRoom: () => void;
  handleJoinRoom: (room: Room) => void;
  handleRenameRoom: (roomId: number, currentName: string) => void;
  handleDeleteRoom: (roomId: number) => void;
}
