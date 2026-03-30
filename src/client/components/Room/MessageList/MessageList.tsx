import { useEffect, useRef, useState } from 'react';
import cn from 'classnames';

import styles from './MessageList.module.scss';
import { useChat } from '../../ChatContext';

import emptyInbox from '../../../images/empty-inbox.png';

export const MessageList = () => {
  const { currentUser, messages, selectedRoom } = useChat();
  const [isToBottomVisible, setIsToBottomVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [selectedRoom]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (lastMessage?.userId === currentUser?.id) {
      handleToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (!messagesEndRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsToBottomVisible(!entry.isIntersecting);
      },
      {
        root: document.querySelector(`.${styles.message_list}`),
        threshold: 0.1,
      },
    );

    observer.observe(messagesEndRef.current);

    return () => observer.disconnect();
  }, [messagesEndRef]);

  const handleToBottom = () => {
    setIsToBottomVisible(false);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.message_list_box}>
      {messages.length > 0 ? (
        <>
          <div className={styles.message_list}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  styles.message,
                  `room_name_color_${+(message.userId || 0) % 5}`,
                  {
                    [styles.message_current_user]:
                      message.userId === currentUser?.id,
                  },
                )}
              >
                <p className="title is-6">{message.author.username}</p>
                <p className="subtitle is-6">{message.text}</p>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          <div
            className={cn(styles.to_bottom, {
              [styles.visible]: isToBottomVisible,
            })}
            onClick={handleToBottom}
          >
            <p className="subtitle is-7">Scroll to new messages</p>
          </div>
        </>
      ) : (
        <div className={styles.empty_box}>
          <img src={emptyInbox} alt="empty inbox" />
          <p className="subtitle is-6">You don't have any messages yet...</p>
        </div>
      )}
    </div>
  );
};
