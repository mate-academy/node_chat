import { useState } from "react";
import type { Room } from "../types/Room";
import type { DialogState } from "../types/DialogState";
import { socket } from "../socket";
import { IconButton } from "./IconButton";
import { Pencil } from "./Pencil";
import { Trash } from "./Trash";
import { CreateRoomDialog } from "./CreateRoomDialog";
import { RenameRoomDialog } from "./RenameRoomDialog";
import { DeleteRoomDialog } from "./DeleteRoomDialog";

const DEFAULT_ROOM_ID = "1";

interface RoomListProps {
  rooms: Room[];
  currentRoomId: string | null;
  username: string;
  connected: boolean;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const RoomList = ({
  rooms,
  currentRoomId,
  username,
  connected,
  open,
  onClose,
  onLogout,
}: RoomListProps) => {
  const [dialog, setDialog] = useState<DialogState>(null);
  const closeDialog = () => setDialog(null);

  function join(id: string) {
    if (id !== currentRoomId) socket.emit("room:join", id);
    onClose();
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-10 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-line bg-panel
                    transition-transform md:static md:translate-x-0
                    ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <span className="font-mono text-xs text-muted">rooms</span>
          <button
            onClick={() => setDialog({ type: "create" })}
            className="rounded border border-line px-2 py-1 font-mono text-xs text-text
                       transition-colors hover:border-accent hover:text-accent
                       focus-visible:outline-2 focus-visible:outline-accent"
          >
            + new
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2">
          {rooms.map((room) => {
            const active = room.id === currentRoomId;
            return (
              <div
                key={room.id}
                onClick={() => join(room.id)}
                className={`group flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5
                            font-mono text-sm transition-colors
                            ${active ? "bg-line text-text" : "text-muted hover:bg-line/60 hover:text-text"}`}
              >
                <span className="truncate">
                  <span className={active ? "text-accent" : "text-zinc-600"}>
                    #
                  </span>{" "}
                  {room.name}
                </span>
                <span className="flex shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <IconButton
                    label="Переименовать"
                    onClick={() => setDialog({ type: "rename", room })}
                  >
                    <Pencil />
                  </IconButton>
                  {room.id !== DEFAULT_ROOM_ID && (
                    <IconButton
                      label="Удалить"
                      onClick={() => setDialog({ type: "delete", room })}
                    >
                      <Trash />
                    </IconButton>
                  )}
                </span>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center justify-between border-t border-line px-4 py-3">
          <div className="flex min-w-0 items-center gap-2 font-mono text-xs">
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400"}`}
              title={connected ? "online" : "offline"}
            />
            <span className="truncate text-text">{username}</span>
          </div>
          <button
            onClick={onLogout}
            className="font-mono text-xs text-muted transition-colors hover:text-text
                       focus-visible:outline-2 focus-visible:outline-accent"
          >
            log out
          </button>
        </div>
      </aside>

      {dialog?.type === "create" && <CreateRoomDialog onClose={closeDialog} />}
      {dialog?.type === "rename" && (
        <RenameRoomDialog room={dialog.room} onClose={closeDialog} />
      )}
      {dialog?.type === "delete" && (
        <DeleteRoomDialog room={dialog.room} onClose={closeDialog} />
      )}
    </>
  );
};
