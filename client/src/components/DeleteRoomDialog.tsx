import { socket } from "../socket";
import type { Room } from "../types/Room";
import { Dialog } from "./Dialog";
import { DialogActions } from "./DialogActions";

interface DeleteRoomDialogProps {
  room: Room;
  onClose: () => void;
}
export const DeleteRoomDialog = ({ room, onClose }: DeleteRoomDialogProps) => {
  return (
    <Dialog
      title="Delete room"
      description={`Room #${room.name} and its entire history will be deleted. Participants will be moved to General. This action cannot be undone.`}
      onClose={onClose}
      onSubmit={() => {
        socket.emit("room:delete", room.id);
        onClose();
      }}
    >
      <DialogActions onClose={onClose} submitLabel="Delete" danger />
    </Dialog>
  );
};
