import { useState } from 'react';
import { createUser } from './services/chatService';

const getStoredUser = () => {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  if (!userId || !username) {
    return null;
  }

  return {
    id: userId,
    username,
  };
};

const App = () => {
  const [user, setUser] = useState(getStoredUser);

  const handleLogin = async (username) => {
    const createdUser = await createUser(username);

    localStorage.setItem('userId', createdUser.id);

    localStorage.setItem('username', createdUser.username);

    setUser(createdUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');

    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <ChatPage user={user} onLogout={handleLogout} />;
};

export default App;
