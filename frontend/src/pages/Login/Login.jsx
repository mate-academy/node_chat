import { useState } from 'react';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input';
import styles from './Login.module.scss';

export const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');

  const handleLogin = () => {
    if (username.trim()) {
      localStorage.setItem('username', username);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }
  };

  return (
    <div className={styles.login}>
      <h1>Login Page</h1>
      <div className={styles.login__inputGroup}>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Button onClick={handleLogin}>
          Login
        </Button>
      </div>
    </div>
  );
};
