import React, { useState } from 'react';
import { client } from '../services/client';
import type { User } from '../types';

type Props = {
  onSuccess: (user: User) => void;
};

export const CreateUserModal = ({ onSuccess }: Props) => {
  const [nameU, setName] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nameU.trim().length === 0) {
      setError('Введіть ім’я');

      return;
    }

    try {
      let user: User;

      if (isLogin) {
        user = await client.loginUser(nameU);
      } else {
        user = await client.createUser(nameU);
      }

      window.localStorage.setItem('user', JSON.stringify(user));
      onSuccess(user);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);

      setError(
        isLogin
          ? 'Користувача не знайдено. Створіть акаунт.'
          : 'Помилка реєстрації (можливо, ім’я вже зайняте).',
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: '1px solid #ddd',
        padding: '25px',
        maxWidth: '320px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <h3 style={{ marginTop: 0, textAlign: 'center', color: '#333' }}>
        {isLogin ? 'Вхід в систему' : 'Реєстрація'}
      </h3>

      <input
        type="text"
        value={nameU}
        onChange={(e) => {
          setName(e.target.value);
          setError('');
        }}
        placeholder="Ваше ім'я (напр. Hank)"
        style={{
          width: '100%',
          marginBottom: '10px',
          padding: '10px',
          background: '#f9f9f9',
          color: '#333',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />

      {error && (
        <p style={{ color: '#d9534f', fontSize: '14px', margin: '0 0 10px 0' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        style={{
          padding: '10px 15px',
          background: '#007bff',
          color: '#fff',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          width: '100%',
          marginBottom: '15px',
        }}
      >
        {isLogin ? 'Увійти' : 'Створити акаунт'}
      </button>

      <div style={{ textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          style={{
            background: 'transparent',
            color: '#007bff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            textDecoration: 'underline',
          }}
        >
          {isLogin ? 'Немає акаунту? Реєстрація' : 'Вже є акаунт? Увійти'}
        </button>
      </div>
    </form>
  );
};
