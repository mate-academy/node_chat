import { useState, type FormEvent } from 'react';
import { ApiError } from '../api';

interface Props {
  onSubmit: (username: string) => Promise<void>;
}

export function UsernameForm({ onSubmit }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const name = value.trim();

    if (!name) {
      setError('Enter a username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(name);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setError('This username is already taken');
      } else if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError('Cannot reach the server');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="username-form" onSubmit={handleSubmit}>
      <h1>Welcome to the chat</h1>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Choose a username"
        maxLength={50}
        autoFocus
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Joining...' : 'Join'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
