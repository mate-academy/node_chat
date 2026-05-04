import type { SubmitEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import classNames from 'classnames';
import type { Room } from './types';

type RenameRoomDialogProps = {
  name: string;
  onNameChange: (name: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  open: boolean;
  room: Room;
};

function RenameRoomDialog({
  name,
  onNameChange,
  onOpenChange,
  onSubmit,
  open,
  room,
}: RenameRoomDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop">
          <Dialog.Content className="delete-room-dialog" asChild>
            <form onSubmit={onSubmit}>
              <Dialog.Title className="delete-room-title">
                rename #{room.name}
              </Dialog.Title>
              <label htmlFor="rename-room-name">new room name</label>
              <input
                id="rename-room-name"
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder={room.name}
              />
              <div>
                <Dialog.Close asChild>
                  <button className="app-button" type="button">
                    cancel
                  </button>
                </Dialog.Close>
                <button
                  className={classNames('app-button', 'primary')}
                  disabled={!name.trim() || name.trim() === room.name}
                  type="submit"
                >
                  rename
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default RenameRoomDialog;
