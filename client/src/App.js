import './App.css';
import io from 'socket.io-client';
import { useState } from 'react';
import Chat from './Chat';

const socket = io.connect("http://localhost:3001");

function App() {
  const [userName, setUserName] = useState(localStorage.getItem('user') || '');
  const [room, setRoom] = useState(localStorage.getItem('room') || '');
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (userName !== '' && room) {
      socket.emit('join_room', room);
      setShowChat(true);

      localStorage.setItem('room', room);
      localStorage.setItem('user', userName);
    }
  }

  return (
    <div className="App">
      {!showChat ? (
      <div className='joinChatContainer'>
        <h3>LIVE CHAT</h3>
        <input type='text'
          placeholder='Name...'
          onChange={(e) => {
            setUserName(e.target.value);
          }}
         />

        <select name='room' className='input' required>
          <option>-- Select Room --</option>
          <option value='1'>1</option>
          <option value='2'>2</option>
          <option value='3'>3</option>
          <option value='4'>4</option>
        </select>

        <button onClick={joinRoom}>Join Room</button>
      </div>
      )
      : (
        <Chat socket={socket} userName={userName} room={room} />
      )}
    </div>
  );
}

export default App;
