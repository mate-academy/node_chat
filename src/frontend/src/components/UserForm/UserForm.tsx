import { useContext, useEffect, useState } from 'react';
import { v7 as uuidv7 } from 'uuid';
import { Icon } from '../Icon/Icon';
import style from './UserForm.module.scss';
import classNames from 'classnames';
import { useNavigate } from 'react-router';
import { UserContext } from '../../context/UserContext';

export const UserForm = () => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const { setUserId, setUserName } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!error) {
      return;
    }

    const timeoutId = setTimeout(() => setError(''), 3000);

    return () => clearTimeout(timeoutId);
  }, [error]);

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedName = value.trim();

    if (!normalizedName) {
      setError('User Name cann`t be empty');

      return;
    }

    if (normalizedName.length < 2) {
      setError('Name must be at least 2 characters long');

      return;
    }

    const userId = uuidv7();

    setUserName(normalizedName);
    setUserId(userId);

    navigate('/chat');
  };

  return (
    <section className={style['user-form-section']}>
      <div>
        <Icon className={style['user-form-section__icon']} nameIcon="chat" />
      </div>
      <h2 className={style['user-form-section__title']}>Welcome to Chat</h2>
      <p className={style['user-form-section__info']}>
        Enter your name to continue
      </p>
      <form
        className={style['user-form-section__form']}
        onSubmit={handleSubmit}
      >
        <label htmlFor="user-name">User Name</label>
        <input
          type="text"
          className={style['user-form-section__input']}
          placeholder="Enter yout name"
          id="user-name"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <p
          className={classNames(style['user-form-section__hint'], {
            [style['user-form-section__hint--error']]: !!error,
          })}
        >
          {error || 'Name must be at least 2 characters long'}
        </p>
        <button className={style['user-form-section__button']}>
          Start Communicating
        </button>
      </form>
    </section>
  );
};
