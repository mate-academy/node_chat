import { useEffect, useRef, useState } from 'react';
import { Message } from './Message';
import { Room } from './Room';

export const Dashboard = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newRoom, setNewRoom] = useState('');
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
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();

    wsRef.current = new WebSocket('ws://localhost:3005');

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'init') {
        setMessages(data.messages);
        setRooms(data.rooms);
      }
      // Handle new messages
      else if (data.text && data.username) {
        setMessages((prev) => [...prev, data]);
      }
      // Handle new rooms
      else if (data.name && data.user) {
        setRooms((prev) => [...prev, data]);
      }
      // Handle room updates
      else if (data.type === 'room-updated') {
        setRooms((prev) => prev.map((r) => (r.id === data.id ? data.room : r)));
      }
      // Handle room deletions
      else if (data.type === 'room-deleted') {
        setRooms((prev) => prev.filter((r) => r.id !== data.id));
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
      username: username,
      text: newMessage,
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

  return (
    <div className="dashboard">
      <div className="dashboard__section">
        <h3 className="title is-3 has-text-primary has-text-centered">
          Messages
        </h3>
        <form id="newMessage" onSubmit={handleNewMessage}>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="input is-normal"
            type="text"
            placeholder="Enter message"
          />
          <button className="button is-primary" type="submit">
            Enter
          </button>
        </form>
        <div className="dashboard__section--list">
          {messages.map((m) => (
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
            <Room key={r.id} room={r} setAllRooms={setRooms}/>
          ))}
        </div>
      </div>
    </div>
  );
};
