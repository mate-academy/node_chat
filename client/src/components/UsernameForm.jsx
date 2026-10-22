import { useState } from 'react';

export function UsernameForm({ connectionStatus, onSubmit }) {
  const [usernameInput, setUsernameInput] = useState('');

  function submit(event) {
    event.preventDefault();

    if (onSubmit(usernameInput)) {
      setUsernameInput('');
    }
  }

  return (
    <section className="welcome-card">
      <p className="eyebrow">WELCOME</p>
      <h2>Choose a username</h2>
      <p className="muted">Your name is saved in this browser for your next visit.</p>
      <form className="inline-form" onSubmit={submit}>
        <input
          autoFocus
          aria-label="Username"
          maxLength={32}
          placeholder="e.g. alex"
          value={usernameInput}
          onChange={event => setUsernameInput(event.target.value)}
        />
        <button
          className="primary-button"
          type="submit"
          disabled={connectionStatus !== 'connected'}
        >
          Join chat
        </button>
      </form>
    </section>
  );
}
