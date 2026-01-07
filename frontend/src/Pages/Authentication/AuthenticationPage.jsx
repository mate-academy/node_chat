import { useContext, useState } from 'react';
import styles from './AuthenticationPage.module.scss';
import { User } from 'lucide-react';
import { UserContext } from '../../Context/UserContext';

export const AuthenticationPage = () => {
  const [name, setName] = useState('');
  const { login } = useContext(UserContext);

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authIconContainer}>
          <User size={48} className={styles.authIcon} />
        </div>
        <h1 className={styles.authTitle}>Welcome</h1>
        <span className={styles.authSubtitle}>
          Enter your nickname to join the chat
        </span>
        <form
          className={styles.authForm}
          onSubmit={(e) => {
            e.preventDefault();
            login(name);
          }}
        >
          <input
            type="text"
            value={name}
            placeholder="Nickname"
            className={styles.authInput}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className={styles.authButton}>
            Start a conversation
          </button>
        </form>
      </div>
    </div>
  );
};
