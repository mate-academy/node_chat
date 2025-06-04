import React, { useEffect, useRef, useState } from 'react';
import styles from './Chat.module.scss';
import { useParams } from 'react-router-dom';
import { Message } from './components/Message';
import axios from 'axios';
import { AppBar, Box, Container, Toolbar } from '@mui/material';

interface Message {
  name: string;
  text: string;
  date: string;
}
interface RoomInfo {
  id: string;
  name: string;
  admin: string;
  users: string[];
  limit: string;
}

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [info, setInfo] = useState<RoomInfo | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [onSettings, setOnSettings] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const userName = localStorage.getItem('name');
  const { roomId } = useParams();

  const [settingsValue, setSettingsValue] = useState<string>('');

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3005');
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(
        JSON.stringify({ type: 'join', roomId: roomId, name: userName }),
      );
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'start_connect':
          setMessages(data.payload);
          setInfo(data.info);
          break;

        case 'message':
          setMessages((prev) => [...prev, data.payload]);
          break;

        case 'changed':
          setInfo(data.payload);
          break;
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputValue.trim() === '') return;

    const message = {
      type: 'message',
      roomId: roomId,
      user: userName,
      text: inputValue,
    };

    socketRef.current?.send(JSON.stringify(message));
    setInputValue('');
  };

  const handleSettingsSubmit = async (method: string, value: string) => {
    const requestData = {
      roomId: roomId,
      user: userName,
      method: {
        type: method,
        payload: value,
      },
    };

    console.log(JSON.stringify(requestData));

    await axios.patch('http://localhost:3005/rooms', requestData);
  };

  return (
    <Container sx={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <Box
        sx={{ marginInline: 'auto', }}

      >
        {info && (
          <Toolbar
            sx={{
              bgcolor: '#00897b',
            }}
          >
            <img
              src="images/groups.png"
              className={styles.info__image}
              alt="Room logo"
            />
            <h2 className={styles.info__title}>{info.name}</h2>
            <strong className={styles.info__id}>{info.id}</strong>
            <p
              className={styles.info__users}
            >{`Users: ${info.users.length}/${info.limit}`}</p>

            {info.admin === userName && (
              <button
                onClick={() => setOnSettings((prev) => !prev)}
                className={styles.info__settings}
              >
                settings
              </button>
            )}
          </Toolbar>
        )}
        <div className={styles.chat__messages}>
          {messages.map((msg, index) => (
            <Message
              key={index}
              user={msg.name}
              text={msg.text}
              date={msg.date}
              isPeronal={msg.name === userName}
            />
          ))}
        </div>
        <form className={styles.chat__form} onSubmit={handleSubmit}>
          <input
            className={styles.chat__form__input}
            type="text"
            placeholder="enter a message"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button className={styles.chat__form__button} type="submit">
            Send
          </button>
        </form>
        {onSettings && (
          <div className={styles.settings}>
            <button
              onClick={() =>
                handleSettingsSubmit('delete', roomId ?? 'undefined')
              }
            >
              Delete room
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSettingsSubmit('rename', settingsValue);
              }}
            >
              <label>
                <h4>Rename room</h4>
                <input
                  type="text"
                  value={settingsValue}
                  onChange={(e) => setSettingsValue(e.target.value)}
                  placeholder="enter new room name"
                />
              </label>
              <button type="submit">submit</button>
            </form>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSettingsSubmit('deleteUser', settingsValue);
              }}
            >
              <label>
                <h4>Delete user</h4>
                <input
                  type="text"
                  value={settingsValue}
                  onChange={(e) => setSettingsValue(e.target.value)}
                  placeholder="enter user ID"
                />
              </label>
              <button type="submit">submit</button>
            </form>
          </div>
        )}
      </Box>
    </Container>
  );
};
