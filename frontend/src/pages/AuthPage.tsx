import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.tsx'

export const AuthPage = () => {
  const [name, setName] = useState('');
  const { setUserName } = useAuth()
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) return;
    try {
      setUserName(name);
    } catch (error) {
      console.error('Registration failed', error);
    }
  }

  return (
    <div className="section">
      <form
        className='box'
        onSubmit={handleSubmit}
      >
        <h1 className="title">Enter your name </h1>
        <div className="field">
          <label htmlFor="username" className="label">
            Write your username
          </label>
          <div className="control">
            <input
              className='input'
              id='username'
              type="text"
              placeholder='username'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

        </div>
        <button
          className='button is-fullwidth'
          type="submit">submit</button>
      </form>
    </div>

  );
};
