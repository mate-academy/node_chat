import { useState } from 'react';

interface Props {
  onUsernameSet: (username: string) => void;
}

export const UsernameSetter: React.FC<Props> = ({ onUsernameSet }) => {
  const [username, setUsername] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!username) return;

    localStorage.setItem('username', username);
    onUsernameSet(username);
  }

  return (
    <form className="field is-horizontal" onSubmit={handleSubmit}>
      <input
        type="text"
        className="input"
        placeholder="Username"
        value={username}
        onChange={event => setUsername(event.target.value)}
      />
      <button type='submit' className="button">Set</button>
    </form>
  );
};
