import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../store/UserContext';
import api from '../../utils/api';
import './LoginForm.css';

export const LoginForm = () => {
  const [userName, setUserName] = useState(
    localStorage.getItem('username') || '',
  );
  const { setUser } = useContext(UserContext);

  const createUser = async (e) => {
    e.preventDefault();
    if (!userName) return;
    const newUser = await api.createUser({ name: userName });
    console.log('newUser', newUser);
    localStorage.setItem('username', userName);
    setUser(newUser);
  };

  useEffect(() => {
    setUserName(localStorage.getItem('username') || '');
  }, []);

  return (
    <form className="LoginForm" onSubmit={createUser}>
      <input
        className="LoginForm__input"
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        required
        placeholder="Enter your name..."
      />
      <button type="submit" className="LoginForm__btn">
        Join
      </button>
    </form>
  );
};
