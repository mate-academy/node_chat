import { useState } from 'react';

export function UsernameForm({ onSubmit }) {
  const [value, setValue] = useState('');

  return (
    <form
      className="field is-horizontal"
      onSubmit={(event) => {
        event.preventDefault();

        if (value.trim()) {
          onSubmit(value.trim());
        }
      }}
    >
      <input
        className="input"
        aria-label="Username"
        placeholder="Enter your username"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button type="submit" className="button">
        Join
      </button>
    </form>
  );
}