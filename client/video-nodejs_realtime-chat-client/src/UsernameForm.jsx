import { useState } from 'react';

export const UsernameForm = ({ onSubmit }) => {
  const [username, setUsername] = useState('');

  return (
    <form
      className="field"
      onSubmit={(event) => {
        event.preventDefault();
        if (!username.trim()) return;

        localStorage.setItem('username', username);
        onSubmit(username);
      }}
    >
      <input
        className="input"
        placeholder="Enter your username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <button className="button">Enter chat</button>
    </form>
  );
};