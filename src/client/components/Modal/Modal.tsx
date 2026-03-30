import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const Modal: React.FC<Props> = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKey);

    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return createPortal(
    <div
      className={`overlay ${isVisible ? 'open' : ''}`}
      onClick={onClose}
      data-theme="dark"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ height: 'fit-content' }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};
