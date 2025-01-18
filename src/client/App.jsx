import { Route, Routes } from 'react-router-dom';
import { io } from 'socket.io-client';
import Home from './components/home/home';
import Rooms from './components/rooms/rooms';
import Chat from './components/chat/chat';

const socket = io('http://localhost:5000');

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home socket={socket} />} />
      <Route path="/rooms" element={<Rooms socket={socket} />} />
      <Route path="/room/:roomId" element={<Chat socket={socket} />} />
    </Routes>
  );
};

export default App;
