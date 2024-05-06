import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import { User } from '../../types/user';
import { API_URL } from '../../utils/config';

type Props = {
  send: (u: User) => void;
};

export const AuthorForm: React.FC<Props> = ({ send }) => {
  const [userName, setUserName] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    axios
      .post(`${API_URL}user/login`, {
        name: userName,
      })
      .then((user: any) => {
        localStorage.setItem('author', JSON.stringify(user.data));
        send(user.data);
      });
  };

  return (
    <div className="auth">
      <div className="auth__cover"></div>
      <div className="auth__blur"></div>
      <div className="auth__wrapper">
        <div className="auth__modal">
          <h2 className="auth__title">Welcome to Chat</h2>
          <p className="auth__text">Please login</p>
          <form className="auth__form" onSubmit={event => handleSubmit(event)}>
            <input
              type="text"
              className="input"
              placeholder="Enter your name"
              required
              value={userName}
              onChange={newEvent => setUserName(newEvent.target.value)}
            />
            <button className="auth__button button">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};
