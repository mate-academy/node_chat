import { useState } from 'react';

type Props = {
  onSubmit: (name: string) => void;
};

export const UsernameForm = ({ onSubmit }: Props) => {
  const [name, setName] = useState('');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!name.trim()) return;
        onSubmit(name.trim());
      }}
    >
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Your name"
      />
      <button>Join</button>
    </form>
  );
};
