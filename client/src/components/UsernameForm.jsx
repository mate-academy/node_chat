import { useState } from 'react';
import { userService } from '../services/userService.js';

export const UsernameForm = ({ onSave }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await userService.save(username);
      onSave(username);
    } catch {
      setError('Failed to save username. Try again.');
    }
  };

  return (
    <form className="field is-horizontal" onSubmit={handleSubmit}>
      <input
        type="text"
        className="input"
        placeholder="Enter your username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <button className="button">Join</button>
      {error && <p className="help is-danger">{error}</p>}
    </form>
  );
};
