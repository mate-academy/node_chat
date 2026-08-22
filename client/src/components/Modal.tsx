import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0  flex items-center justify-center text-slate-300"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="elements-color w-full max-w-2xs rounded-xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex justify-between items-center p-4">
          <h3 className="">{title}</h3>
          <button onClick={onClose} className="cursor-pointer">
            <XMarkIcon className="w-6 mt-1" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>,
    modalRoot,
  );
};
