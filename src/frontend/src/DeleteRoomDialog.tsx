import type { SubmitEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import classNames from 'classnames';
import type { Room } from './types';

type DeleteRoomDialogProps = {
  confirmation: string;
  onConfirmationChange: (confirmation: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  open: boolean;
  room: Room;
};

function DeleteRoomDialog({
  confirmation,
  onConfirmationChange,
  onOpenChange,
  onSubmit,
  open,
  room,
}: DeleteRoomDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop">
          <Dialog.Content className="delete-room-dialog" asChild>
            <form onSubmit={onSubmit}>
              <Dialog.Title className="delete-room-title">
                delete #{room.name} ?
              </Dialog.Title>
              <label htmlFor="delete-room-confirm">
                type the room name to confirm
              </label>
              <input
                id="delete-room-confirm"
                value={confirmation}
                onChange={(event) => onConfirmationChange(event.target.value)}
                placeholder={room.name}
              />
              <div>
                <Dialog.Close asChild>
                  <button className="app-button" type="button">
                    cancel
                  </button>
                </Dialog.Close>
                <button
                  className={classNames('app-button', 'danger', 'solid')}
                  disabled={confirmation !== room.name}
                  type="submit"
                >
                  delete
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default DeleteRoomDialog;
