import type React from "react";

interface IconButton {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}

export const IconButton = ({ label, onClick, children }: IconButton) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      title={label}
      className="rounded p-1 text-muted transition-colors hover:bg-line hover:text-text
                 focus-visible:outline-2 focus-visible:outline-accent"
    >
      {children}
    </button>
  );
};
