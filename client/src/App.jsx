import { useState } from 'react';
import './App.css';
import { Chat } from './Chat.jsx';
import { UsernameForm } from './UsernameForm.jsx';

export function App() {
  const [username, setUsername] = useState(
    () => localStorage.getItem('username') || '',
  );

  function saveUsername(name) {
    localStorage.setItem('username', name);
    setUsername(name);
  }

  function logout() {
    localStorage.removeItem('username');
    setUsername('');
  }

  return (
    <section className="section content">
      {username ? (
        <Chat username={username} onLogout={logout} />
      ) : (
        <UsernameForm onSubmit={saveUsername} />
      )}
    </section>
  );
}