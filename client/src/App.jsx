import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';
import Rooms from './components/Rooms';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useEffect } from 'react';
import { createUser } from './api/users';

const queryClient = new QueryClient();

export default function App() {
  const [username, setUsername] = useState(
    () => localStorage.getItem('username') || '',
  );

  useEffect(() => {
    const saveUser = async () => {
      const trimmed = username.trim();
      if (!trimmed) return;

      localStorage.setItem('username', trimmed);

      try {
        await createUser(trimmed);
      } catch (err) {
        return err;
      }
    };

    if (username) {
      saveUser();
    }
  }, [username]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={username ? '/rooms' : '/login'} />}
          />
          <Route path="/login" element={<Login setUsername={setUsername} />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:roomId" element={<ChatRoom username={username} />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
