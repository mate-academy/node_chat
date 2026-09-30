import { socket } from "../socket";
import { NameDialog } from "./NameDialog";

export const CreateRoomDialog = ({ onClose }: { onClose: () => void }) => {
  return (
    <NameDialog
      title="New room"
      description="All participants will see the name."
      submitLabel="Create"
      onSubmit={(name) => socket.emit("room:create", name)}
      onClose={onClose}
    />
  );
};
