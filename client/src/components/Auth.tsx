import type React from 'react';
import { useState } from 'react';

interface Props {
  onLogin: (username: string) => void;
}

export const Auth: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState<string>('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username) {
      return;
    }

    localStorage.setItem('username', username);
    onLogin(username);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your username..."
            value={username}
            onChange={event => setUsername(event.target.value)}
          />
          <button type="submit">Join Chat</button>
        </form>
      </div>
    </div>
  );
};
