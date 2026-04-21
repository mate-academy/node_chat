import React, { useState } from 'react';
import axios from 'axios';

interface LoginProps {
  onLogin: (user: { id: number; username: string }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5700/api/login', { username });
      const userData = response.data;

      localStorage.setItem('chat_user', JSON.stringify(userData));

      onLogin(userData);
    } catch (err) {
      alert('Помилка входу');
      console.log('Помилка входу', err);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Введіть ім'я для чату</h2>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ваш нікнейм..."
          required
        />
        <button type="submit">Увійти</button>
      </form>
    </div>
  );
};
