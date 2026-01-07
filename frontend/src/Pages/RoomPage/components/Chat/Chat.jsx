import { useContext } from 'react';
import styles from './Chat.module.scss';
import { Trash } from 'lucide-react';
import { RoomsContext } from '../../../../Context/RoomsContext';

export const Chat = ({ user, roomId, messages }) => {
  const { sendMessage } = useContext(RoomsContext);

  return (
    <div className={styles.chat}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`${styles.messageItem} ${
            user === message.author ? styles.itemRight : styles.itemLeft
          }`}
        >
          <div className={styles.info}>
            <span className={styles.userName}>{message.author}</span>
            <span className={styles.time}>
              {message.createdAt.split('T')[1].split('.')[0]}
            </span>
          </div>
          <div
            className={`${styles.message} ${
              user === message.author ? styles.messageRight : styles.messageLeft
            }`}
          >
            <p className={styles.text}>{message.text}</p>
            {user === message.author && (
              <Trash
                className={styles.deleteIcon}
                onClick={() =>
                  sendMessage('DELETE_MESSAGE', { id: message.id, roomId })
                }
                size={18}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
