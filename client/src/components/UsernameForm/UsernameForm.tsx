import { useState } from 'react';
import './UsernameForm.scss';

type Props = {
  onSubmit: (name: string) => void;
};

export const UsernameForm = ({ onSubmit }: Props) => {
  const [name, setName] = useState('');

  return (
    <main className="login">
      <div className="login__card">
        <div className="login__icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
          </svg>
        </div>

        <h1 className="login__title">Ласкаво просимо</h1>
        <p className="login__subtitle">Як тебе звати?</p>

        <form
          className="login__form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            onSubmit(name.trim());
          }}
        >
          <input
            className="login__input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Твоє імʼя"
            aria-label="Твоє імʼя"
            autoFocus
          />
          <button className="login__button">Увійти</button>
        </form>
      </div>
    </main>
  );
};
