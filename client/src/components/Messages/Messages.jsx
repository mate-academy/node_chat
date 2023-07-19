import { useState, useEffect, useRef } from 'react';
import './Messages.css';

export const Messages = ({ socket }) => {
  const [messagesRecieved, setMessagesReceived] = useState([]);
  const messagesColumnRef = useRef(null);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessagesReceived((state) => [
        ...state,
        {
          message: data.message,
          userName: data.userName,
          createdtime: data.createdtime,
        },
      ]);
    });

    return () => socket.off('receive_message');
  }, [socket]);

  useEffect(() => {
    socket.on('last_messages', (lastMessages) => {

      lastMessages = sortMessagesByDate(lastMessages);
      setMessagesReceived((state) => [...lastMessages, ...state]);
    });

    return () => socket.off('last_messages');
  }, [socket]);

  useEffect(() => {
    if(messagesColumnRef !== null) {
      messagesColumnRef.current.scrollTop = messagesColumnRef.current.scrollHeight;
    }
  }, [messagesRecieved]);

  function formatDateFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  function sortMessagesByDate(messages) {
    return messages.sort(
      (a, b) => parseInt(a.createdtime) - parseInt(b.createdtime)
    );
  }

  return (
    <div className="messages-column" ref={messagesColumnRef}>
      {messagesRecieved.map((message, i) => (
        <div className="message" key={i}>
          <div className="message-container">
            <span className="message-meta">{message.userName}</span>
            <span className="message-meta">
              {formatDateFromTimestamp(message.createdtime)}
            </span>
          </div>
          <p className="message-text">{message.message}</p>
          <br />
        </div>
      ))}
    </div>
  );
};
