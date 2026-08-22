import { useState } from 'react';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError('Username is required');

      return;
    }

    try {
      setError('');
      setLoading(true);

      await onLogin(trimmedUsername);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="columns is-centered" style={{ marginTop: '120px' }}>
        <div className="column is-5">
          <div className="box">
            <h1 className="title has-text-centered">Chat</h1>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="label">Username</label>

                <div className="control">
                  <input
                    className={`input ${error ? 'is-danger' : ''}`}
                    value={username}
                    onChange={(changeEvent) =>
                      setUsername(changeEvent.target.value)
                    }
                    placeholder="Enter your username"
                    autoFocus
                  />
                </div>

                {error && <p className="help is-danger">{error}</p>}
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
