import { useContext } from 'react';
import styles from './Header.module.scss';
import { MessageCircle, LogOut } from 'lucide-react';
import { UserContext } from '../../Context/UserContext';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <div className={styles.iconContainer}>
          <MessageCircle className={styles.icon} />
        </div>
        <h1 className={styles.logoTitle}>NodeChat</h1>
      </div>
      <div className={styles.actions}>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user}</div>
          <span className={styles.userStatus}>
            <span className={styles.userCircle}></span>
            Online
          </span>
        </div>
        <button
          className={styles.buttonContainer}
          onClick={() => {
            logout();
          }}
        >
          <LogOut size={25} className={styles.logOutIcon} />
        </button>
      </div>
    </header>
  );
};
