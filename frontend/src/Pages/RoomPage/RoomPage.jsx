import { useParams } from 'react-router-dom';
import { Chat } from './components/Chat';
import { Composer } from './components/Composer';
import { Header } from './components/Header';
import styles from './RoomPage.module.scss';
import { useContext } from 'react';
import { RoomsContext } from '../../Context/RoomsContext';
import { UserContext } from '../../Context/UserContext';
import { useState } from 'react';
import { useEffect } from 'react';
import { Error } from '../../components/Error';

export const RoomPage = () => {
  const { roomId } = useParams();
  const { sendMessage, socket, rooms } = useContext(RoomsContext);
  const [messages, setMessages] = useState([]);
  const { user } = useContext(UserContext);
  const [error, setError] = useState('');
  const [isErrorMessageOpen, setErrorMessageOpen] = useState(false);
  const [membersCount, setMembersCount] = useState(0);

  const currentRoom = rooms.find((room) => room.id === roomId);

  useEffect(() => {
    if (!socket) {
      return;
    }

    sendMessage('JOIN_ROOM', { roomId, userName: user });

    const handleMessages = (event) => {
      const { type, payload } = JSON.parse(event.data);

      if (type === 'LOAD_HISTORY') {
        setMessages(payload);
      }

      if (type === 'NEW_MESSAGE') {
        if (String(payload.roomId) === String(roomId)) {
          setMessages((prev) => [...prev, payload]);
        }
      }

      if (type === 'DELETE_MESSAGE') {
        if (String(payload.roomId) === String(roomId)) {
          setMessages((prev) =>
            prev.filter((message) => message.id !== payload.id),
          );
        }
      }

      if (type === 'MEMBERS_COUNT') {
        if (String(payload.roomId) === String(roomId)) {
          setMembersCount(payload.count);
        }
      }

      if (type === 'ERROR') {
        setError(payload.message);
        setErrorMessageOpen(true);
      }
    };

    socket.addEventListener('message', handleMessages);

    return () => {
      socket.removeEventListener('message', handleMessages);
    };
  }, [roomId, socket, sendMessage, user]);

  if (!currentRoom) {
    return <h1>Loading room information</h1>;
  }

  return (
    <div className={styles.roomPage}>
      <Header
        membersCount={membersCount}
        currentRoom={currentRoom}
        roomId={roomId}
      />
      <Chat user={user} roomId={roomId} messages={messages} />
      <Composer roomId={roomId} user={user} />
      <Error
        errorMessage={error}
        isErrorMessageOpen={isErrorMessageOpen}
        closeErrorMessage={() => setErrorMessageOpen(false)}
      />
    </div>
  );
};
