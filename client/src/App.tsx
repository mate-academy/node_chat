import React, { useState } from 'react';
import { Login } from './components/Login/Login';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatWindow } from './components/ChatWindow/ChatWindow';
import styles from './App.module.scss';
import { ChatProvider } from './context/ChatProvider';

const App: React.FC = () => {
  const [user, setUser] = useState<{ id: number, username: string } | null>(
    () => {
      const savedUser = localStorage.getItem('chat_user');
      return savedUser ? JSON.parse(savedUser) : null;
    },
  );
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('chat_user');
    setUser(null);
    setActiveRoomId(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <ChatProvider>
      <div className={styles.app_layout}>
        <Sidebar
          onSelectRoom={setActiveRoomId}
          activeRoomId={activeRoomId}
          userId={user.id}
        />
        {activeRoomId ? (
          <ChatWindow
            roomId={activeRoomId}
            setActiveRoomId={setActiveRoomId}
            handleLogout={handleLogout}
            user={user}
          />
        ) : (
          <h2>
            Вітаємо, {user.username}! Виберіть чат для спілкування.
          </h2>
        )}
      </div>
    </ChatProvider>
  );
};

export default App;
