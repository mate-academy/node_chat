import React, { useState } from 'react';
import * as Types from '../types';
import { userService } from '../services/userService';

interface LoginModalProps {
  onLogin: (user: Types.User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim()) {
      setUsername('');
      return;
    }

    try {
      const user = await userService.getOrCreateByName(username);
      onLogin(user);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <section
        role="dialog"
        aria-labelledby="login-title"
        aria-describedby="login-description"
        className="bg-white p-6 rounded-lg shadow-lg w-80"
      >
        <h2 id="login-title" className="text-2xl font-semibold mb-4">
          Login
        </h2>
        <p id="login-description" className="sr-only">
          Please enter your username to log in.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
              aria-required="true"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-lg"
          >
            Enter
          </button>
        </form>
      </section>
    </div>
  );
};

export default LoginModal;
