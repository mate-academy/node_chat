import { useEffect, useState } from 'react';
import styles from '../chat/chat.module.css';
import { useNavigate, useParams } from 'react-router-dom';

const Chat = ({ socket }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const { roomId: roomParam } = useParams();

  useEffect(() => {
    const roomId = roomParam;

    if (!roomId) {
      return;
    }
    socket.emit('getUserList');
    socket.emit('getMessageList');

    socket.on('userList', (data) => {
      if (data[roomId]) {
        setUsers(data[roomId].users || []);
      }
    });

    socket.on('messageList', (data) => {
      if (data[roomId]) {
        setMessages(data[roomId].messages || []);
      }
    });

    return () => {
      socket.off('userList');
      socket.off('messageList');
    };
  }, [socket, roomParam]);

  const handleLeaveRoom = (roomId) => {
    socket.emit('leaveRoom', { roomId });
    navigate('/rooms');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (message.trim()) {
      socket.emit('message', { message, roomId: roomParam });
      setMessage('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <ul>
          {users.length > 0 ? (
            users.map((user) => <li key={user.userId}>{user.userName}</li>)
          ) : (
            <li>No users in this room.</li>
          )}
        </ul>

        <button
          className={styles.btnLeave}
          onClick={() => handleLeaveRoom(roomParam)}
        >
          leave
        </button>
      </div>

      <div className={styles.messageBlock}>
        {messages.length > 0 &&
          messages.map((mes) => (
            <div key={mes.mesId}>
              <p className={styles.name}>{mes.author}</p>
              <div
                className={
                  mes.socketId === socket.id ? styles.sender : styles.recipient
                }
              >
                <p className={styles.text}>{mes.text}</p>
                <span className={styles.timestamp}>
                  {new Intl.DateTimeFormat('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(mes.timestamp))}
                </span>
              </div>
            </div>
          ))}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className={styles.btnSend}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
