import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { useUser } from '../context/UserContext';

export const AuthComponent: React.FC = () => {
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const userExist = await userService.getByEmail(email, password);

      if (!userExist) {
        setError('User not found. Please register first.');
        return navigate('/auth/register');
      }
      setUser(userExist);
      console.log('User logged in:', userExist);
      navigate('/chats');
    } catch (error) {
      console.error(error);
      alert('An error occurred');
      setError('Failed to login. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleAuth} className="box">
        <h1 className="title">Login</h1>
        {error && <p className="has-text-danger">{error}</p>}
        <div className="field">
          <label className="label">Email</label>
          <div className="control">
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="field">
          <label className="label">Password</label>
          <div className="control">
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <button className="button is-primary" type="submit">
          Login
        </button>
        <p>
          Don't have an account? <Link to="/auth/register">Register</Link>
        </p>
      </form>
    </div>
  );
};
