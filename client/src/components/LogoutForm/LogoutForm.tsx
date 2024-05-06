import React from 'react';
import axios from 'axios';
import './LogoutForm.scss';
import { API_URL } from '../../utils/config';
import { User } from '../../types/user';

type Props = {
  logout: () => void;
  author: User | null;
};

export const LogoutForm: React.FC<Props> = ({ logout, author }) => {
  const handleLogout = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    axios
      .post(`${API_URL}user/logout`, {
        user: author,
      })
      .then(() => {
        logout();
      });
  };

  return (
    <div className="logout">
      <button
        className="button logout__button"
        onClick={event => handleLogout(event)}
      >
        Logout
      </button>
    </div>
  );
};
