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
          username: data.username,
          createdtime: data.createdtime,
        },
      ]);
    });

    return () => socket.off('receive_message');
  }, [socket]);

  useEffect(() => {
    socket.on('last_100_messages', (lastMessages) => {

      lastMessages = sortMessagesByDate(lastMessages);
      setMessagesReceived((state) => [...lastMessages, ...state]);
    });

    return () => socket.off('last_100_messages');
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
    <div className="messagesColumn" ref={messagesColumnRef}>
      {messagesRecieved.map((msg, i) => (
        <div className="message" key={i}>
          <div className="messageContainer">
            <span className="msgMeta">{msg.username}</span>
            <span className="msgMeta">
              {formatDateFromTimestamp(msg.createdtime)}
            </span>
          </div>
          <p className="msgText">{msg.message}</p>
          <br />
        </div>
      ))}
    </div>
  );
};
