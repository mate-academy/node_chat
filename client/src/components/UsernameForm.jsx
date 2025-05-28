import { useState } from "react";
import './UsernameForm.css';

function UsernameForm({ onSubmit }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
    }
  };

  return (
    <form className="username_form" onSubmit={handleSubmit}>
      <h2>👋 Привіт! Як тебе звати?</h2>
      <input
        className="username_input"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Введи імʼя"
      />
      <button type="submit" className="username_button">Продовжити</button>
    </form>
  );
}

export default UsernameForm;
