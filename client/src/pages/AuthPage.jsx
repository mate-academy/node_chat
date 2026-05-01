import { useState } from 'react';
import './AuthPage.scss';

function AuthPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isRegister ? '/api/register' : '/api/login';

    // Формуємо корисне навантаження залежно від режиму
    const payload = isRegister
      ? {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
        }
      : {
          email: formData.email,
          password: formData.password,
        };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || 'Auth failed');
      }

      const data = await response.json();

      localStorage.setItem('chat_user', JSON.stringify(data));
      onLoginSuccess(data);
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isRegister ? 'Create an account' : 'Log in to chat'}</h2>
        <form className="form" onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <input
                className="form-element"
                placeholder="Name"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <input
                className="form-element"
                type="tel"
                placeholder="Phone number"
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </>
          )}
          <input
            className="form-element"
            type="email"
            placeholder="Email"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <input
            className="form-element"
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
          <button className="button" type="button">
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <button
          type="button"
          className="link-button"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? (
            <>
              Already have an account? <b>Login</b>
            </>
          ) : (
            <>
              Don&apos;t have an account? <b>Register</b>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default AuthPage;
