import { useEffect, useRef, useState } from 'react';
import { Message } from './Message';
import { Room } from './Room';

export const Dashboard = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [activeRoomId, setActiveRoomId] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [messagesRes, roomsRes] = await Promise.all([
          fetch('http://localhost:3005/messages'),
          fetch('http://localhost:3005/rooms'),
        ]);
        const messagesData = await messagesRes.json();
        const roomsData = await roomsRes.json();
        setMessages(messagesData);
        setRooms(roomsData);

        if (roomsData.length > 0) {
          setActiveRoomId(roomsData[0].id);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();

    wsRef.current = new WebSocket('ws://localhost:3005');

    wsRef.current.onOpen = () => {
      // Send username when connection opens
      wsRef.current.send(
        JSON.stringify({
          type: 'user-connected',
          username: username,
        }),
      );
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'init':
          setMessages(data.messages);
          setRooms(data.rooms);
          if (data.rooms.length > 0 && !activeRoomId) {
            setActiveRoomId(data.rooms[0].id);
          }
          break;

        case 'message':
          setMessages((prev) => [...prev, data]);
          break;

        case 'room':
          setRooms((prev) => {
            const newRooms = [...prev, data];
            if (prev.length === 0) {
              setActiveRoomId(data.id);
            }
            return newRooms;
          });
          break;

        case 'room-updated':
          setRooms((prev) =>
            prev.map((r) => (r.id === data.id ? data.room : r)),
          );
          break;

        case 'room-deleted':
          setRooms((prev) => {
            const filtered = prev.filter((r) => r.id !== data.id);
            if (data.id === activeRoomId) {
              setActiveRoomId(filtered.length > 0 ? filtered[0].id : null);
            }
            return filtered;
          });
          break;

        default:
          break;
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleNewMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    const message = {
      type: 'message',
      author: username,
      text: newMessage,
      roomId: activeRoomId,
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }

    setNewMessage('');
  };

  const handleNewRoom = (e) => {
    e.preventDefault();

    if (!newRoom.trim()) {
      return;
    }

    const room = {
      type: 'room',
      user: username,
      name: newRoom,
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(room));
    }

    setNewRoom('');
  };

  const filteredMessages = messages.filter((m) => m.roomId === activeRoomId);

  return (
    <div className="dashboard">
      <div className="dashboard__section">
        <h3 className="title is-3 has-text-primary has-text-centered">
          Messages
          {activeRoomId && (
            <span className="is-size-6 has-text-grey-light ml-2">
              (
              {rooms.find((r) => r.id === activeRoomId)?.name ||
                'Select a room'}
              )
            </span>
          )}
        </h3>
        <form id="newMessage" onSubmit={handleNewMessage}>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="input is-normal"
            type="text"
            placeholder={activeRoomId ? 'Enter message' : 'Select a room first'}
            disabled={!activeRoomId}
          />
          <button className="button is-primary" type="submit">
            Enter
          </button>
        </form>
        <div className="dashboard__section--list">
          {filteredMessages.map((m) => (
            <Message key={m.id} message={m} />
          ))}
        </div>
      </div>
      <div className="dashboard__section">
        <h3 className="title is-3 has-text-warning has-text-centered">Rooms</h3>
        <form id="newRoom" onSubmit={handleNewRoom}>
          <input
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            className="input is-normal"
            type="text"
            placeholder="Enter room name"
          />
          <button className="button is-warning" type="submit">
            Enter
          </button>
        </form>
        <div className="dashboard__section--list">
          {rooms.map((r) => (
            <Room
              key={r.id}
              room={r}
              setAllRooms={setRooms}
              isActive={r.id === activeRoomId}
              onSelect={() => setActiveRoomId(r.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
