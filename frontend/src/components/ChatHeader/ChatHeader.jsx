import { useContext } from 'react';
import { UserContext } from '../../store/UserContext';
import './ChatHeader.css';

export const ChatHeader = () => {
  const { user, setUser } = useContext(UserContext);
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <div className="Chat__header ChatHeader">
      <label className="ChatHeader__label">{user.name}</label>
      <button className="ChatHeader__btn" onClick={handleLogout}>
        👣
      </button>
    </div>
  );
};
