// #region imports 
import { useEffect, useState } from 'react';
import './App.css'
import { MessageForm } from './MessageForm.jsx';
import { MessageList } from './MessageList.jsx';
import { apiUtils } from './API/apiUtils.js';
import { Room } from './Room.jsx';
// #endregion

const DataLoader = ({ onData, room, userName }) => {
  const WS_URL = 'ws://localhost:3005';
  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socket.addEventListener('open', () => {
      socket.send(JSON.stringify(
        { text: `${userName} join the room`, userName, room, type: 'join' }
      ));
    });

    socket.addEventListener('message', (event) => {
      const text = JSON.parse(event.data)

      onData(text);
    });

    return () => {
      socket.close();
    };
  }, [])

  return (
    <h1 className="title">Chat application</h1>
  );
};

export function App() {
  const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState(null);
  const [room, setRoom] = useState(1);

  useEffect(() => {
    if (!localStorage.getItem('name')) {
      let name = '';

      while (!name) {
        name = prompt('Please enter your name');
      }

      apiUtils.post({
        userName: name, room, type: 'join'
      })

      setUserName(name);
      localStorage.setItem('name', name);
    } else {
      const name = localStorage.getItem('name');
      setUserName(name)
    }
  }, [room]);

  function saveData(message) {
    setMessages((messages) => { return [...messages, message] })
  }

  return (
    <section className="section content">
      <h3>Hi, {userName}</h3>
      <Room room={room} setRoom={setRoom} />
      <DataLoader onData={saveData} room={room} userName={userName} />
      <MessageForm room={room} userName={userName} />
      <MessageList messages={messages} />
    </section>
  )
}
