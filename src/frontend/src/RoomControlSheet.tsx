import * as Dialog from '@radix-ui/react-dialog';
import classNames from 'classnames';
import { useState, type SubmitEvent } from 'react';
import type { Room } from './types';

type RoomControlSheetProps = {
  canManageRoom: boolean;
  onDeleteRoom: (room: Room) => void;
  onLeaveRoom: (room: Room) => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  onRenameRoom: (room: Room, name: string) => Promise<Room | null>;
  room: Room | null;
};

function RoomControlSheet({
  canManageRoom,
  onDeleteRoom,
  onLeaveRoom,
  onOpenChange,
  onRenameRoom,
  room,
}: RoomControlSheetProps) {
  const [name, setName] = useState(room?.name ?? '');
  const canSaveName =
    canManageRoom && Boolean(name.trim()) && name.trim() !== room?.name;

  const handleRenameRoom = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!room) {
      return;
    }

    const nextRoom = await onRenameRoom(room, name);

    if (nextRoom) {
      setName(nextRoom.name);
    }
  };

  return (
    <Dialog.Root open={Boolean(room)} onOpenChange={onOpenChange}>
      {room ? (
        <Dialog.Portal>
          <Dialog.Overlay className="room-control-sheet-backdrop" />
          <Dialog.Content className="room-control-sheet">
            <div className="room-control-sheet-handle" aria-hidden="true" />
            <Dialog.Title className="room-control-sheet-title">
              Manage room
            </Dialog.Title>

            <form
              className="room-control-name-form"
              onSubmit={handleRenameRoom}
            >
              <label htmlFor="mobile-room-name">Name</label>
              <div>
                <input
                  id="mobile-room-name"
                  value={name}
                  readOnly={!canManageRoom}
                  onChange={(event) => setName(event.target.value)}
                />
                {canManageRoom ? (
                  <button
                    className={classNames('app-button', 'primary')}
                    disabled={!canSaveName}
                    type="submit"
                  >
                    save
                  </button>
                ) : null}
              </div>
            </form>

            <div className="room-control-sheet-actions">
              <a
                className={classNames('app-button', 'primary')}
                href={`/chat#${encodeURIComponent(room.name)}`}
              >
                {room.joined ? 'Open room' : 'Join room'}
              </a>
              <button
                className="app-button"
                disabled={!room.joined}
                title={
                  room.joined ? 'Leave room' : 'Join the room before leaving it'
                }
                type="button"
                onClick={() => onLeaveRoom(room)}
              >
                Leave room
              </button>
              <button
                className={classNames('app-button', 'danger')}
                disabled={!canManageRoom}
                title={
                  canManageRoom
                    ? 'Delete room'
                    : 'Only the room creator can delete it'
                }
                type="button"
                onClick={() => onDeleteRoom(room)}
              >
                Delete room
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}

export default RoomControlSheet;
