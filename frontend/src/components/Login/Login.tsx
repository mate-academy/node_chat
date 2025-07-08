import { Link, useNavigate } from 'react-router-dom';
import style from './Login.module.scss';
import { useState, type FormEvent } from 'react';
import api from '../../api';
import { useUserStore } from '../../store/store';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const setUserAndToken = useUserStore((state) => state.setUserAndToken);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      const { user, accessToken } = response.data;
      setUserAndToken(user, accessToken);
      navigate(`/chat/${user.id}`, { replace: true });
    } catch {
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={style['login-page']}>
      <section className={style['login-form']}>
        <h1 className={style['login-form__title']}>Login</h1>
        {error && <p className={style['login-form__error-message']}>{error}</p>}
        <form className={style['login-form__form']} onSubmit={handleSubmit}>
          <div className={style['login-form__input']}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              placeholder="Username"
              id="username"
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              disabled={isLoading}
              required
            />
          </div>
          <div className={style['login-form__input']}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              placeholder="Password"
              id="password"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              disabled={isLoading}
              required
            />
          </div>
          <button
            className={style['login-form__button']}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <Link to="/register" className={style['login-form__registration-link']}>
          Don't have an account? Register here.
        </Link>
      </section>
    </main>
  );
};

export default Login;
