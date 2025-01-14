import React, { useState } from 'react';
import { userService } from '../services/userService';
import { Link, useNavigate } from 'react-router-dom';

const RegisterComponent: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await userService.create(name, email, password);
      navigate('/auth/login');
    } catch (error) {
      console.error('Registration failed:', error);
      setError('Failed to register. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleRegister} className="box">
        <h1 className="title">Register</h1>
        {error && <p className="has-text-danger">{error}</p>}
        <div className="field">
          <label className="label">Name</label>
          <div className="control">
            <input
              className="input"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>
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
          Register
        </button>
        <p>
          Already have an account? <Link to="/auth/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterComponent;
