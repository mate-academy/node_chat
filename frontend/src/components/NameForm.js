import { useState } from 'react';

export const NameForm = ({ onNameSave }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState(false);

  const handleNameSubmit = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName || trimmedName.length > 16) {
      setError(true);

      return;
    }

    setName(trimmedName);
    onNameSave(trimmedName);
  }

  const handleInput = (name) => {
    setName(name);
    setError(false);
  }

  return (
    <form onSubmit={handleNameSubmit}>
      <label htmlFor="name">Please enter your name:</label>
      <input
        type="text"
        id="name"
        placeholder="Volodya"
        value={name}
        onChange={event => handleInput(event.target.value)}
      />
      {error && (
        <div>Please enter valid name</div>
      )}
      <button type="submit">Save name</button>
    </form>
  );
}