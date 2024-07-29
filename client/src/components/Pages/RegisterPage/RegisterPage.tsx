import loginImg from '../../../images/login.png';
import userIcon from '../../../images/user.png';
import passIcon from '../../../images/key.png';

import React, { useState } from 'react';
import axios from 'axios';
import { SERVER_API } from "../../../constants/constants.ts";
import './RegisterPage.scss';

type Props = {
  login: (isLogined: boolean) => void;
}

export const RegisterPage: React.FC<Props> = ({ login }) => {
  const [status, setStatus] = useState(false);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (userName === '' || password === '') {
      alert('Please fill in all fields.');
      return;
    }

    axios
      .post(`${SERVER_API}/user/registration`, {
        name: userName,
        password: password,
      })
      .then((user) => {
        localStorage.setItem('user', JSON.stringify(user.data));
        login(true);
      });
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    axios
      .post(`${SERVER_API}/user/login`, {
        name: userName,
        password: password,
      })
      .then((user) => {
        localStorage.setItem('user', JSON.stringify(user.data));
        login(true);
      });
  }

  const clearInputs = () => {
    setUserName('');
    setPassword('');
  };

  return (
    <div className="registerPage">
      <div className="registerPage__block">
        <img src={loginImg} alt='img' className='registerPage__img' />
        {status ? (
          <form
            className='registerPage__form form'
            onSubmit={(e) => handleLogin(e)}
          >
            <div className="form__inputBlock">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder='Enter name'
                className='form__input'
                autoComplete="username"
              />
              <img
                src={userIcon}
                className='form__userIcon'
                alt="userIcon"
              />
            </div>
            <div className="form__inputBlock">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter password'
                className='form__input'
                autoComplete="current-password"
              />
              <img
                src={passIcon}
                className='form__passIcon'
                alt="passIcon"
              />
            </div>
            <button className='form__button'>LOGIN</button>
            <p
              onClick={() => {
                setStatus(false);
                clearInputs();
              }}
              className="form__select"
            >I need to register</p>
          </form>
        ) : (
          <form
            className='registerPage__form form'
            onSubmit={(e) => handleRegister(e)}
          >
            <div className="form__inputBlock">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder='Enter name'
                className='form__input'
                autoComplete="username"
              />
              <img
                src={userIcon}
                className='form__userIcon'
                alt="userIcon"
              />
            </div>
            <div className="form__inputBlock">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter password'
                className='form__input'
                autoComplete="current-password"
              />
              <img
                src={passIcon}
                className='form__passIcon'
                alt="passIcon"
              />
            </div>
            <button className='form__button'>REGISTER</button>
            <p
              onClick={() => {
                setStatus(true);
                clearInputs();
              }}
              className="form__select"
            >I already have an account</p>
          </form>
        )}
      </div>
    </div>
  );
};
