import { useState } from 'react';

export const UsernameForm = ({ onSubmit }) => {
  const [name, setName] = useState('');

  return (
    <form
      className="box username-form"
      onSubmit={(event) => {
        event.preventDefault();

        const trimmed = name.trim();

        if (trimmed) {
          onSubmit(trimmed);
        }
      }}
    >
      <h1 className="title">Chat application</h1>

      <label className="label" htmlFor="username">
        Enter your name to start chatting
      </label>

      <div className="field">
        <input
          id="username"
          type="text"
          className="input"
          placeholder="e.g. Bob"
          value={name}
          onChange={event => setName(event.target.value)}
          autoFocus
        />
        <button className="button is-success" disabled={!name.trim()}>
          Start
        </button>
      </div>
    </form>
  );
};
