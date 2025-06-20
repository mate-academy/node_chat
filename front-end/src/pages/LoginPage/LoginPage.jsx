import { useState } from 'react';
import styles from './LoginPage.module.scss';
import { useAppContext } from '../../context/AppContext';

const BASE_URL = import.meta.env.VITE_API_URL;

export const LoginPage = () => {
  const { handleLogin } = useAppContext();
  const [userName, setUserName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    handleLogin(userName);
  };

  return (
    <section className={styles.modal}>
      <h1 className={styles.modal__title}>Please login</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="userName" className={styles.form__label} />
        Name:
        <input
          className={styles.form__input}
          id="userName"
          name="userName"
          type="text"
          placeholder="Example: Dick"
          onChange={(e) => setUserName(e.target.value)}
        />
        <button className={styles.form__button} type="submit">
          Login
        </button>
      </form>
    </section>
  );
};
