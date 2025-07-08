import { Link, useNavigate } from 'react-router-dom';
import style from './Registration.module.scss';
import { useState, type FormEvent } from 'react';
import api from '../../api';

const Registration = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/registration', { username, password });
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={style['registration-page']}>
      <section className={style['registration-form']}>
        <h1 className={style['registration-form__title']}>Sign up</h1>
        {message && (
          <p className={style['registration-form__success-message']}>
            {message}
          </p>
        )}
        {error && (
          <p className={style['registration-form__error-message']}>{error}</p>
        )}
        <form
          className={style['registration-form__form']}
          onSubmit={handleSubmit}
        >
          <div className={style['registration-form__input']}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              placeholder="Username"
              id="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className={style['registration-form__input']}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              placeholder="Password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className={style['registration-form__input']}>
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              type="password"
              placeholder="Confirm password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <button
            className={style['registration-form__button']}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>
        <Link to="/login" className={style['registration-form__login-link']}>
          Already have an account? Login here.
        </Link>
      </section>
    </main>
  );
};

export default Registration;
