import { useEffect, useState } from 'react';
import './App.css';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Registration } from './components/Registration/Registration';
import { checkAuth } from './functions/checkAuth';
import { Lobby } from './components/Lobby/Lobby';
import { Chat } from './components/Chat/Chat';

export const BASE_URL = 'http://localhost:3005';

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth(setIsAuth, setLoading);
  }, []);

  if (loading) return <h1>Loading, please wait...</h1>;

  return (
    <HashRouter>
      <Routes>
        {!isAuth ? (
          <Route
            path="*"
            element={
              <Registration onLoading={setLoading} onSubmit={setIsAuth} />
            }
          />
        ) : (
          <>
          <Route path="/" element={<Navigate to="/lobby" replace />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/chat/:roomId?" element={<Chat />} />
        </>
        )}
      </Routes>
    </HashRouter>
  );
}

export default App;
