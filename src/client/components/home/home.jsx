import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../home/home.module.css';

const Home = ({ socket }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (userName.trim()) {
      socket.emit('newUser', { userName });
      navigate('/rooms');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Enter name</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ваше ім'я користувача"
          className={styles.input}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <button type="submit" className={styles.button}>
          Приєднатись
        </button>
      </form>
    </div>
  );
};

export default Home;
