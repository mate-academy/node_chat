import React from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { useUser } from '../context/UserContext';

export const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleLogout = async () => {
    await userService.logout();
    setUser(null);
    navigate('/auth/login');
  };

  return (
    <button onClick={handleLogout} className="button is-danger logout-button">
      Logout
    </button>
  );
};
