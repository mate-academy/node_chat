import React, { useState, useCallback } from 'react';
import styles from './ChatList.module.scss';
import { type Chat } from '../../types/types';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chat: Chat) => void;
  onCreateNewChat: (chatName: string) => Promise<void>;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChatId,
  onSelectChat,
  onCreateNewChat,
}) => {
  const [newChatName, setNewChatName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = useCallback(async () => {
    const trimmedName = newChatName.trim();

    if (trimmedName.length < 3 || isCreating) {
      setError('Name must be at least 3 characters');
      return;
    }

    setError('');
    setIsCreating(true);

    try {
      await onCreateNewChat(trimmedName);
      setNewChatName('');
    } catch (err) {
      console.error('Failed to create chat:', err);
      setError('Failed to create chat.');
    } finally {
      setIsCreating(false);
    }
  }, [newChatName, isCreating, onCreateNewChat]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewChatName(e.target.value);
      if (error) setError(''); 
    },
    [error],
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !isCreating) {
        handleCreate();
      }
    },
    [handleCreate, isCreating],
  );

  const handleChatSelect = useCallback(
    (chat: Chat) => {
      onSelectChat(chat);
    },
    [onSelectChat],
  );

  return (
    <aside className={styles['chat-list']}>
      <div className={styles['chat-list__header']}>
        <h3 className={styles['chat-list__heading']}>Your Chats</h3>
      </div>
      <div className={styles['chat-list__create-form']}>
        <input
          type="text"
          className={styles['chat-list__create-new-chat-input']}
          placeholder="New chat name..."
          value={newChatName}
          onChange={handleInputChange}
          onKeyUp={handleKeyPress}
          disabled={isCreating}
        />
        <button
          className={styles['chat-list__create-new-chat-button']}
          onClick={handleCreate}
          disabled={isCreating || newChatName.trim().length < 3}
        >
          {isCreating ? '...' : '+'}
        </button>
      </div>
      {error && <p className={styles['chat-list__error']}>{error}</p>}
      <ul className={styles['chat-list__items']}>
        {chats.length > 0 ? (
          chats.map((chat) => (
            <li
              key={chat.id}
              onClick={() => handleChatSelect(chat)}
              className={`${styles['chat-list__item']} ${
                chat.id === selectedChatId
                  ? styles['chat-list__item--selected']
                  : ''
              }`}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleChatSelect(chat);
                }
              }}
            >
              {chat.name}
            </li>
          ))
        ) : (
          <li className={styles['chat-list__empty']}>
            No chats yet. Create one!
          </li>
        )}
      </ul>
    </aside>
  );
};

export default ChatList;
