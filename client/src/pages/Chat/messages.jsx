import styles from './styles.module.css';
import { useState, useEffect, useRef } from 'react';

const Messages = ({ socket }) => {
  const [messagesRecieved, setMessagesReceived] = useState([]);
  const messagesColumnRef = useRef(null);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      console.log(data);
      setMessagesReceived((state) => [
        ...state,
        {
          message: data.message,
          username: data.username,
          __createdtime__: data.__createdtime__,
        },
      ]);
    });

    return () => socket.off('receive_message');
  }, [socket]);

  useEffect(() => {
    socket.on('last_100_messages', (last100Messages) => {
      console.log('Last 100 messages:', last100Messages);

      if (Array.isArray(last100Messages)) {
        setMessagesReceived((state) => [...last100Messages, ...state]);
      } else {
        console.error('Invalid messages data:', last100Messages);
      }
    });

    return () => socket.off('last_100_messages');
  }, [socket]);


  useEffect(() => {
    messagesColumnRef.current.scrollTop =
      messagesColumnRef.current.scrollHeight;
  }, [messagesRecieved]);


  function formatDateFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  return (
    <div className={styles.messagesColumn} ref={messagesColumnRef}>
      {messagesRecieved.map((msg, i) => (
        <div className={styles.message} key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className={styles.msgMeta}>{msg.username}</span>
            <span className={styles.msgMeta}>
              {formatDateFromTimestamp(msg.__createdtime__)}
            </span>
          </div>
          <p className={styles.msgText}>{msg.message}</p>
          <br />
        </div>
      ))}
    </div>
  );
};

export default Messages;
