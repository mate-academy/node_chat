import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

import './App.scss';
import { Room } from './helpers/types/Room';
import { getUserName } from './helpers/utils/manageLocalState';
import { roomsApi } from './helpers/api/roomsApi';

import { HomePage } from './pages/HomePage';
import { ChatPage } from './pages/ChatPage';
import { RoomsPage } from './pages/RoomsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const socket: Socket = io('http://localhost:3005');

export const App = () => {
  const [chatRooms, setChatRooms] = useState<Room[]>([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    setUserName(getUserName);
    roomsApi.getRooms().then(setChatRooms);
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={(
              <HomePage
                userName={userName}
                setUserName={setUserName}
                chatRooms={chatRooms}
              />
            )}
          />
          <Route
            path="/chat/:chatId"
            element={(
              <ChatPage
                userName={userName}
                chatRooms={chatRooms}
                socket={socket}
              />
            )}
          />
          <Route
            path="/rooms"
            element={(
              <RoomsPage
                chatRooms={chatRooms}
                setChatRooms={setChatRooms}
              />
            )}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
};
