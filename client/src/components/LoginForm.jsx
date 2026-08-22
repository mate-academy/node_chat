import React, { useState } from 'react';

const LoginForm = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Username is required');

      return;
    }

    try {
      setError('');
      setLoading(true);

      await onLogin(trimmedName);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div
        className="columns is-centered"
        style={{ marginTop: '120px' }}
      >
        <div className="column is-5">
          <div className="box">
            <h1 className="title has-text-centered">
              Chat
            </h1>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="label">
                  Username
                </label>

                <div className="control">
                  <input
                    className={`input ${
                      error ? 'is-danger' : ''
                    }`}
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Enter your username"
                    autoFocus
                  />
                </div>

                {error && (
                  <p className="help is-danger">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className={`button is-primary is-fullwidth ${
                  loading ? 'is-loading' : ''
                }`}
                disabled={loading}
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
