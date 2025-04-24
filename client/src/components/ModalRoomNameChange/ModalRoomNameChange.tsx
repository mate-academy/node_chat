import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Form } from 'react-bulma-components';

interface Props {
  oldName: string;
  isActive: boolean;
  onAction: (result: string) => Promise<void> | void;
  onClose: () => void;
}
export const ModalRoomNameChange: React.FC<Props> = ({
  oldName,
  isActive = true,
  onAction,
  onClose,
}) => {
  const [isActiveState, setIsActiveState] = useState(isActive);
  const [roomName, setRoomName] = useState('');
  useEffect(() => {
    setRoomName(oldName);
    setIsActiveState(isActive);
  }, [isActive, oldName]);

  return (
    <div
      className={classNames('modal', {
        'is-active': isActiveState,
      })}
    >
      <div className="modal-background"></div>

      <div className="modal-card ">
        <header className="modal-card-head ">
          <p className="modal-card-title has-text-centered">
            <span>Room Name Change</span>
          </p>

          <button
            className="delete"
            aria-label="close"
            onClick={() => {
              setIsActiveState(false);
              onClose();
            }}
          ></button>
        </header>

        <section className="modal-card-body py-3 is-multiline">
          <Form.Field>
            <Form.Label>Please entre new room name:</Form.Label>
            <Form.Control>
              <Form.Input
                type="text"
                placeholder="New Room Name"
                defaultValue={roomName}
                value={roomName}
                onChange={(e) => {
                  setRoomName(e.target.value);
                }}
              />
            </Form.Control>
          </Form.Field>
        </section>

        <footer className="modal-card-foot is-flex-direction-row-reverse py-3">
          <div className="buttons">
            <button
              style={{ minWidth: '100px' }}
              className="button has-background-success is-rounded"
              onClick={() => {
                setIsActiveState(false);
                onAction(roomName);
              }}
            >
              Change
            </button>

            <button
              style={{ minWidth: '100px' }}
              className="button has-background-danger is-rounded"
              onClick={() => {
                setIsActiveState(false);
                onClose();
              }}
            >
              Cancel
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
