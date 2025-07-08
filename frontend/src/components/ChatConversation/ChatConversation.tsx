import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from 'react';
import { type Message, type User } from '../../types/types';
import styles from './ChatConversation.module.scss';
import { useUserStore } from '../../store/store';

type ChatConversationProps = {
  messages: Message[];
  currentUser: User | null;
  onSendMessage: (content: string) => void;
  currentChatName: string;
};

const ChatConversation: React.FC<ChatConversationProps> = ({
  messages,
  currentUser,
  onSendMessage,
  currentChatName,
}) => {
  const [newMessageText, setNewMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const [isInputRename, setIsInputRename] = useState(true);
  const [chatName, setChatName] = useState(currentChatName);

  const { renameChat, selectedChat, delateChat } = useUserStore();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom();
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length, scrollToBottom]);

  const handleSend = useCallback(() => {
    const trimmedText = newMessageText.trim();

    if (trimmedText === '') return;

    onSendMessage(trimmedText);
    setNewMessageText('');
  }, [newMessageText, onSendMessage]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewMessageText(e.target.value);
    },
    [],
  );

  const handleRenameTitle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    renameChat(selectedChat?.id || '', chatName);
    setIsInputRename(false);
  };

  const handleDeleteChat = async () => {
    try {
      await delateChat(selectedChat?.id || '');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className={styles['chat-conversation']}>
      <div className={styles['chat-conversation__heading']}>
        <form
          className={styles['chat-conversation__title-form']}
          onSubmit={handleRenameTitle}
        >
          <input
            className={`${styles['chat-conversation__title']} ${!isInputRename ? styles['chat-conversation__title-rename'] : ''}`}
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            disabled={isInputRename}
          />

          {!isInputRename && (
            <button
              className={styles['chat-conversation__rename-button']}
              type="submit"
            >
              Send
            </button>
          )}
        </form>

        <div className={styles['chat-conversation__actions']}>
          <button
            className={styles['chat-conversation__rename-button']}
            onClick={() => {
              setIsInputRename(!isInputRename);
            }}
          >
            Rename
          </button>
          <button
            className={styles['chat-conversation__delete-button']}
            onClick={async () => {
              await handleDeleteChat();
            }}
          >
            Delete
          </button>
        </div>
      </div>
      <div className={styles['chat-conversation__messages']}>
        {messages.map(
          (msg) => (
            console.log(msg),
            (
              <div
                key={msg.id}
                className={`${styles['chat-message']} ${
                  msg.senderId === currentUser?.id
                    ? styles['chat-message--my']
                    : styles['chat-message--other']
                }`}
              >
                {msg.senderId !== currentUser?.id ? (
                  <p className={styles['chat-message__sender']}>
                    {msg.sender.name}
                  </p>
                ) : (
                  <p className={styles['chat-message__sender']}>
                    {msg.sender.name}
                  </p>
                )}
                <p className={styles['chat-message__text']}>{msg.content}</p>
                <p className={styles['chat-message__timestamp']}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hourCycle: 'h23', 
                  })}
                </p>
              </div>
            )
          ),
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles['chat-conversation__input-area']}>
        <input
          type="text"
          placeholder="Type a message..."
          className={styles['chat-conversation__input']}
          value={newMessageText}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
        <button
          className={styles['chat-conversation__send-button']}
          onClick={handleSend}
          disabled={!newMessageText.trim()}
        >
          Send
        </button>
      </div>
    </section>
  );
};

export default ChatConversation;
