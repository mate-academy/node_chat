import { NameDialog } from "./NameDialog";
import { socket } from "../socket";
import type { Room } from "../types/Room";

interface RenameRoomDialogProps {
  room: Room;
  onClose: () => void;
}

export const RenameRoomDialog = ({ room, onClose }: RenameRoomDialogProps) => {
  return (
    <NameDialog
      title="Переименовать комнату"
      initial={room.name}
      submitLabel="Сохранить"
      onSubmit={(name) => socket.emit("room:rename", { id: room.id, name })}
      onClose={onClose}
    />
  );
};
