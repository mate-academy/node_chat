import React from 'react';
import { LogoutButton } from './LogoutButton';
import { useUser } from '../context/UserContext';

interface HeaderComponentProps {
  onOpenCreateNewChatModal: () => void;
  selectedChatName: string | null;
}

export const HeaderComponent: React.FC<HeaderComponentProps> = ({
  onOpenCreateNewChatModal,
  selectedChatName,
}) => {
  const { user } = useUser();

  return (
    <header className="hero header">
      <div className="hero-body is-flex is-align-items-center is-justify-content-space-between">
        <h1 className="title has-text-success">{user?.name}</h1>
        {selectedChatName && <h2 className="title">{selectedChatName}</h2>}
        <div className="buttons is-right">
          <button
            className="button is-primary mr-2"
            onClick={onOpenCreateNewChatModal}
          >
            New Chat
          </button>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
};
