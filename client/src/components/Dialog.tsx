import React, { useEffect } from 'react'
import { createPortal } from 'react-dom';

interface DialogProps {
  title: string;
  description: string;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}

export const Dialog = ({
  title,
  description,
  onClose,
  onSubmit,
  children,
}: DialogProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="dialog-in w-full max-w-sm rounded-lg border border-line bg-panel p-5"
      >
        <h2 className="font-mono text-sm text-text">{title}</h2>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}
        {children}
      </form>
    </div>,
    document.body,
  );
};
