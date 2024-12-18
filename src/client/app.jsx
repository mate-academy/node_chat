import { JoinForm } from './components/JoinForm';

import './styles.css';
import styles from './app.module.css';
import { MessageForm } from './components/MessageForm';
import { Messages } from './components/Messages';
import { Status } from './components/Status';
import { Room } from './components/Room';
import { useState } from 'react';

export const App = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [statusText, setStatusText] = useState('');
  const [room, setRoom] = useState(null);

  const connect = (data) => {
    if (!socket) {
      const newSocket = new WebSocket('ws://localhost:3001');

      newSocket.onopen = () => {
        setStatusText('Connected to server');
        newSocket.send(JSON.stringify(data));
      };

      newSocket.onmessage = (evt) => {
        const messageData = JSON.parse(evt.data);

        switch (messageData.type) {
          case 'created':
            setRoom(messageData.room);
            break;
          case 'message':
            setMessages((prevMessages) => [
              ...prevMessages,
              messageData.message,
            ]);
            break;
          case 'joined':
            setRoom(messageData.room);
            setMessages(messageData.messages);
            break;
          case 'removed':
            setRoom(null);
            setMessages([]);
            setStatusText(messageData.message);
            break;
          case 'renamed':
            setRoom(messageData.room);
            setStatusText(messageData.message);
            break;
          default:
            setStatusText(messageData.message);
            break;
        }
      };

      newSocket.onerror = (error) => {
        setStatusText('WebSocket error:', error);
      };

      newSocket.onclose = () => {
        setStatusText('WebSocket connection closed');
        setSocket(null);
        setMessages([]);
        setRoom(null);
      };

      setSocket(newSocket);
    } else {
      socket.send(JSON.stringify(data));
    }
  };

  const sendMessage = (message) => {
    const data = { ...message, type: 'message', room };

    socket.send(JSON.stringify(data));
  };

  return (
    <div className={styles.app}>
      <div>
        <h1 className={styles.app__title}>Chat application</h1>
        {socket && room ? (
          <Room room={room} socket={socket} />
        ) : (
          <JoinForm connect={connect} />
        )}
      </div>
      {socket && room && (
        <>
          <Messages messages={messages} className={styles.app__messages} />
          <MessageForm send={sendMessage} />
        </>
      )}

      <Status text={statusText} />
    </div>
  );
};
