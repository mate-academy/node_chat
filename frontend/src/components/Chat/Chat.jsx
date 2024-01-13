import { useEffect, useState } from 'react';
import { getRooms } from '../../api.js';
import { MessageForm } from '../MessageForm/MessageForm.jsx';
import { MessageList } from '../MessageList/MessageList.jsx';
import { NameChooser } from '../NameChooser/NameChooser.jsx';
import { Rooms } from '../Rooms/Rooms.jsx';
import './Chat.css';
import { socket } from '../../webSocket.js';

<h1 className="title">Chat application</h1>;
export function App() {
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const [name, setName] = useState('');

  socket.onmessage = event => {
    const data = event.data;
    setMessages(JSON.parse(data));
    console.log(`Received data: ${data}`, messages);
  };

  useEffect(() => {
    const nameFromLS = localStorage.getItem('userName') || '';
    getRooms().then(res => {
      setRooms(res.data);
    });

    setName(nameFromLS);
  }, [setName]);

  return (
    <section className="section">
      <h1 className="title">Chat application</h1>

      <NameChooser
        name={name}
        setName={setName}
      />
      {!room ? (
        <Rooms
          rooms={rooms}
          setRoom={setRoom}
          setRooms={setRooms}
          setMessages={setMessages}
        />
      ) : (
        <>
          <MessageForm
            name={name}
            room={room}
          />
          <MessageList messages={messages} />
        </>
      )}
    </section>
  );
}
