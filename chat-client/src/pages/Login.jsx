import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('username', username.trim());
      navigate('/rooms');
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h2 className="title">Enter your name</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <div className="control">
              <input
                className="input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          </div>
          <button className="button is-primary" type="submit">
            Continue
          </button>
        </form>
      </div>
    </section>
  );
};

export default Login;

