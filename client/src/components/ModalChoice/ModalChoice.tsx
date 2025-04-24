import classNames from 'classnames';
import React, { useEffect, useState } from 'react';

interface Props {
  title: string;
  body: string;
  isActive: boolean;
  onAction?: (result: boolean) => void | Promise<void>;
}
export const ModalChoice: React.FC<Props> = ({
  title = 'Error',
  body = 'We encounter error',
  isActive = true,
  onAction: onClose,
}) => {
  const [isActiveState, setIsActiveState] = useState(isActive);
  useEffect(() => setIsActiveState(isActive), [isActive]);

  function handleClose(res: boolean) {
    if (onClose) {
      onClose(res);
    }
    setIsActiveState(false);
  }

  return (
    <div
      className={classNames('modal', {
        'is-active': isActiveState,
      })}
    >
      <div className="modal-background"></div>
      <div className="modal-card ">
        <header className="modal-card-head has-background-danger">
          <p className="modal-card-title">{title}</p>
          <button
            className="delete"
            aria-label="close"
            onClick={() => handleClose(false)}
          ></button>
        </header>
        <section className="modal-card-body py-3 is-multiline">{body}</section>
        <footer className="modal-card-foot is-flex-direction-row-reverse py-3">
          <div className="buttons">
            <button
              style={{ minWidth: '100px' }}
              className="button has-background-success is-rounded"
              onClick={() => handleClose(true)}
            >
              Yes
            </button>
            <button
              style={{ minWidth: '100px' }}
              className="button has-background-danger is-rounded"
              onClick={() => handleClose(false)}
            >
              No
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
