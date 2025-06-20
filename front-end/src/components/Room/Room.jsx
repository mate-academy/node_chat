import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import styles from './Room.module.scss';
import api from '../../services/api';
import { useEffect } from 'react';
import { useRef } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL;
const BASE_URL_WS = import.meta.env.VITE_API_URL_WS;

export const Room = () => {
  const { selectedRoom, user } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');
  const messagesEndRef = useRef(null);

  // console.log(user.name);

  // console.log(messages);

  const getMessages = async () => {
    try {
      const response = await api.get(`${BASE_URL}/messages/${selectedRoom.id}`);
      return response;
    } catch (error) {
      console.error(
        'Get message error:',
        error.response?.data || error.message,
      );
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    async function loadInitial() {
      const data = await getMessages();
      setMessages(data.data);
    }

    loadInitial();
  }, [selectedRoom]);

  useEffect(() => {
    const socket = new WebSocket(`${BASE_URL_WS}`);

    socket.addEventListener('message', (event) => {
      const content = JSON.parse(event.data);

      if (+content.roomId === +selectedRoom.id) {
        setMessages((prev) => [...prev, content]);
      } else {
        console.log('Wrong room');
      }
    });

    return () => {
      socket.close();
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    console.log('sendMessage');

    try {
      const response = await api.post(
        `${BASE_URL}/messages/${selectedRoom.id}`,
        {
          content: textInput,
          id: user.id,
          name: user.name,
        },
      );

      setTextInput('');

      // console.log('Message sent:', response.data);
    } catch (error) {
      console.error('Message not sent:', error.response?.data || error.message);
    }
  };

  const dateFormatter = (isoString) => {
    const date = new Date(isoString);

    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <section className={styles.room}>
      {selectedRoom ? (
        <div className={styles.room__wrapper}>
          <h1 className={styles.room__title}>{selectedRoom.roomName}</h1>

          <ul className={styles.room__chat}>
            {messages.map((message) =>
              user?.id === message?.User?.id || user?.id === message?.userId ? (
                <li
                  className={styles['message-activeUser']}
                  key={message.createdAt}
                >
                  {/* {console.log(user.id, message?.UserId)} */}
                  <div className={styles.message__content}>
                    {message.content}
                  </div>

                  <div className={styles.message__date}>
                    {dateFormatter(message.createdAt)}
                  </div>
                </li>
              ) : (
                <li className={styles.message} key={message.createdAt}>
                  {/* {console.log(user.id, message?.userId)} */}

                  <div className={styles.message__name}>
                    {message?.User?.name || message?.name}
                  </div>

                  <div className={styles.message__content}>
                    {message.content}
                  </div>

                  <div className={styles.message__date}>
                    {dateFormatter(message.createdAt)}
                  </div>
                </li>
              ),
            )}
            <div ref={messagesEndRef} />
          </ul>

          <form className={styles.room__form} onSubmit={handleSendMessage}>
            <input
              className={styles.room__input}
              type="text"
              name="text"
              value={textInput}
              placeholder="Type something..."
              onChange={(e) => setTextInput(e.target.value)}
            />

            <button className={styles.room__button} type="submit">
              Send
            </button>
          </form>
        </div>
      ) : (
        <div className={styles.selectRoom__wrapper}>
          <h2 className={styles.selectRoom__title}>Select room...</h2>
        </div>
      )}
    </section>
  );
};
