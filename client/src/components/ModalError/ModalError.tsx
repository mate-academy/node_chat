import classNames from 'classnames';
import React, { useEffect, useState } from 'react';

interface Props {
  title: string;
  body: string;
  isActive: boolean;
  onClose?: () => void;
}

export const ModalError: React.FC<Props> = ({
  title = 'Error',
  body = 'We encounter error',
  isActive = true,
  onClose,
}) => {
  const [isActiveState, setIsActiveState] = useState(isActive);
  useEffect(() => setIsActiveState(isActive), [isActive]);

  function handleClose() {
    if (onClose) {
      onClose();
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
            onClick={() => handleClose()}
          ></button>
        </header>
        <section className="modal-card-body py-3 is-multiline">{body}</section>
        <footer className="modal-card-foot is-flex-direction-row-reverse py-3">
          <div className="buttons">
            <button className="button is-rounded" onClick={() => handleClose()}>
              Close
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
