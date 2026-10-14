import type React from 'react';
import style from './Modal.module.scss';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  isOpen: boolean
  children: ReactNode;
  closeModal: () => void,
};

export const Modal: React.FC<Props> = ({isOpen, children, closeModal }) => {
  if(!isOpen) {
    return null;
  }

  return createPortal(
    <div className="overlay" onClick={closeModal}>
      <div className={style.modal} onClick={e => e.stopPropagation()}>{children}</div>
    </div>,
    document.body
  );
};
