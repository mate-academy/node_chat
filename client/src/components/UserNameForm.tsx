import { useState } from 'react';
import { sendUsername } from '../api';

interface Props {
  onUsernameSaved: (username: string) => void;
}

export const UserNameForm = ({ onUsernameSaved }: Props) => {
  const [username, setUsername] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      return;
    }

    await sendUsername(trimmedUsername);

    localStorage.setItem('username', trimmedUsername);
    onUsernameSaved(trimmedUsername);
  }

  return (
    <form className="field is-horizontal" onSubmit={handleSubmit}>
      <input
        type="text"
        className="input"
        placeholder="Enter your username"
        value={username}
        onChange={event => setUsername(event.target.value)}
      />

      <button className="button">Save</button>
    </form>
  );
};
