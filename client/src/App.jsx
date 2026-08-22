import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import { createUser } from './services/chatService';

const getStoredUser = () => {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  if (!userId || !username) {
    return null;
  }

  return {
    id: userId,
    name: username,
  };
};

const App = () => {
  const [user, setUser] = useState(
    getStoredUser,
  );

  const handleLogin = async (name) => {
    const user = await createUser(name);

    localStorage.setItem(
      'userId',
      user.id,
    );

    localStorage.setItem(
      'username',
      user.name,
    );

    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');

    setUser(null);
  };

  if (!user) {
    return (
      <LoginPage
        onLogin={handleLogin}
      />
    );
  }

  return (
    <ChatPage
      user={user}
      onLogout={handleLogout}
    />
  );
};

export default App;
