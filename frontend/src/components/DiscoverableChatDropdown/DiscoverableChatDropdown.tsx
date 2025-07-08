import React, { useCallback, useState } from 'react';
import styles from './DiscoverableChatDropdown.module.scss';
import { type Chat } from '../../types/types';

interface DiscoverableChatDropdownProps {
  chats: Chat[];
  onJoinChat: (chatId: string) => Promise<void>;
  onClose: () => void;
}

const DiscoverableChatDropdown: React.FC<DiscoverableChatDropdownProps> = ({
  chats,
  onJoinChat,
  onClose,
}) => {
  const [joiningChatId, setJoiningChatId] = useState<string | null>(null);

  const handleJoin = useCallback(
    async (chatId: string) => {
      if (joiningChatId) return;

      setJoiningChatId(chatId);

      try {
        await onJoinChat(chatId);
        onClose();
      } catch (error) {
        console.error('Failed to join chat:', error);
      } finally {
        setJoiningChatId(null);
      }
    },
    [onJoinChat, onClose, joiningChatId],
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleDropdownClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className={styles['discoverable-dropdown-overlay']}
      onClick={handleOverlayClick}
    >
      <div
        className={styles['discoverable-dropdown']}
        onClick={handleDropdownClick}
      >
        <div className={styles['discoverable-dropdown__header']}>
          <h3>Discover New Chats</h3>
          <button
            className={styles['discoverable-dropdown__close-button']}
            onClick={onClose}
            type="button"
          >
            &times;
          </button>
        </div>
        <ul className={styles['discoverable-dropdown__list']}>
          {chats.length > 0 ? (
            chats.map((chat) => (
              <li
                key={chat.id}
                className={styles['discoverable-dropdown__item']}
              >
                <span>{chat.name}</span>
                <button
                  className={styles['discoverable-dropdown__join-button']}
                  onClick={() => handleJoin(chat.id)}
                  disabled={joiningChatId === chat.id}
                  type="button"
                >
                  {joiningChatId === chat.id ? 'Joining...' : 'Join'}
                </button>
              </li>
            ))
          ) : (
            <li className={styles['discoverable-dropdown__empty']}>
              No new chats to discover.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DiscoverableChatDropdown;
