import { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Auth } from './components/Auth.jsx';
import { ChatList } from './components/ChatList.jsx';
import { ChatRoom } from './components/ChatRoom.jsx';

function ProtectedRoute({ userName, children }) {
  return userName ? children : <Navigate to="/" replace />;
}

export function App() {
  const [userName, setUserName] = useState(localStorage.getItem('userName'));

  function ProtectedLogin() {
    return !userName ? <Auth setUserName={setUserName} /> : <ChatList userName={userName} />;
  }

  return (
    <main className="app">
      <h1 className="app__title">Chat App</h1>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedLogin />}></Route>
          <Route
            path="/:id"
            element={
              <ProtectedRoute userName={userName}>
                <ChatRoom userName={userName} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
}
