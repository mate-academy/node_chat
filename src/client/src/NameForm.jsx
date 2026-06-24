import { useState } from 'react';

export const NameForm = ({ onSubmit }) => {
  const [name, setName] = useState('');

  return (
    <form
      className="field is-horizontal"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(name);
      }}
    >
      <input
        type="text"
        className="input"
        placeholder="Enter your name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <button className="button">Join</button>
    </form>
  );
};
