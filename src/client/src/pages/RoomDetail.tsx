import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { MessageList } from '../components/MessageList';
import { MessageForm } from '../components/MessageForm';
import { client } from '../services/client';
import { socket } from '../services/socket';
import type { Message, User, Room } from '../types';

export const RoomDetail = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [roomName, setRoomName] = useState<string>('Завантаження...');
  const [participants, setParticipants] = useState<User[]>([]);

  const fetchData = async (currentUser: User) => {
    if (!roomId) {
      return;
    }

    try {
      await client.joinRoom(roomId, currentUser._id);

      const rooms = await client.getAllRooms();
      const currentRoom = rooms.find((r: Room) => r._id === roomId);

      if (currentRoom) {
        setRoomName(currentRoom.name);
        setParticipants(currentRoom.users || []);
      } else {
        setRoomName('Кімнату не знайдено');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Помилка завантаження даних кімнати:', error);
    }
  };

  useEffect(() => {
    const storedUser = window.localStorage.getItem('user');
    let parsedUser: User | null = null;

    if (storedUser) {
      parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchData(parsedUser as User);
    }

    if (roomId && parsedUser) {
      socket.connect();
      socket.emit('join_room', roomId);

      socket.on('history', (historyMessages: Message[]) => {
        setMessages(historyMessages);
      });

      socket.on('new_message', (newMessage: Message) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      socket.on('participants_updated', (updatedParticipants: User[]) => {
        setParticipants(updatedParticipants);
      });
    }

    return () => {
      socket.off('history');
      socket.off('new_message');
      socket.off('participants_updated');
      socket.disconnect();
    };
  }, [roomId]);

  if (!user) {
    return (
      <div style={{ color: '#333', padding: '20px' }}>
        Увійдіть, щоб переглядати кімнату.
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        color: '#333',
        flexGrow: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <NavBar />
      <h2
        style={{
          borderBottom: '2px solid #ddd',
          paddingBottom: '10px',
          color: '#222',
        }}
      >
        Кімната: {roomName}
      </h2>

      <div
        style={{
          display: 'flex',
          flexGrow: 1,
          gap: '20px',
          marginTop: '10px',
        }}
      >
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <MessageList messages={messages} />

          <MessageForm roomId={roomId!} authorId={user._id} />
        </div>

        <div
          style={{
            width: '250px',
            backgroundColor: '#ffffff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h3
            style={{
              marginTop: 0,
              fontSize: '16px',
              borderBottom: '1px solid #eee',
              paddingBottom: '10px',
            }}
          >
            Учасники ({participants.length})
          </h3>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              overflowY: 'auto',
            }}
          >
            {participants.length === 0 ? (
              <li style={{ color: '#888', fontSize: '14px' }}>
                Немає учасників
              </li>
            ) : (
              participants.map((p) => (
                <li
                  key={p._id}
                  style={{
                    padding: '8px 0',
                    borderBottom: '1px solid #f9f9f9',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#28a745',
                      marginRight: '8px',
                    }}
                  ></span>
                  {p.name}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
