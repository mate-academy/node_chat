import { useState, type SubmitEvent } from 'react';
import classNames from 'classnames';
import './App.css';
import { login, loginErrors } from './api';
import ChatPage from './ChatPage';
import RoomsPage from './RoomsPage';

const usernameKey = 'chat.username';
const duplicateUsernameMessage = 'That name is already in use. Try another.';

function App() {
  const storedUsername = localStorage.getItem(usernameKey);
  const username = storedUsername?.trim();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextUsername = String(formData.get('username') || '').trim();

    if (!nextUsername) {
      setError('Enter a username to join the chat.');

      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const data = await login(nextUsername);

      localStorage.setItem(usernameKey, data.username);
      globalThis.location.assign('/chat');
    } catch (loginError) {
      if (
        loginError instanceof Error &&
        loginError.message === loginErrors.duplicateUsername
      ) {
        setError(duplicateUsernameMessage);

        return;
      }

      setError('Could not join the chat. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (['/chat', '/rooms'].includes(globalThis.location.pathname) && !username) {
    globalThis.history.replaceState(null, '', '/login');
  }

  if (globalThis.location.pathname === '/rooms') {
    return <RoomsPage />;
  }

  if (globalThis.location.pathname === '/chat') {
    return <ChatPage />;
  }

  if (globalThis.location.pathname !== '/login') {
    globalThis.history.replaceState(null, '', '/login');
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-panel">
          <h1 id="login-title">Chat App</h1>
          <p>Pick a name to join the chat.</p>

          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="username">Username</label>
            <input
              className={classNames({ 'has-error': Boolean(error) })}
              id="username"
              name="username"
              type="text"
              placeholder="your name"
              autoComplete="username"
              defaultValue={storedUsername || ''}
            />
            {error ? (
              <p className="login-error" id="username-error">
                {error}
              </p>
            ) : null}
            <button disabled={isSubmitting} type="submit">
              <span className="desktop-label">
                {isSubmitting ? 'Joining...' : 'Join chat'}
                <img
                  className="button-arrow"
                  src="/src/assets/arrow.svg"
                  alt=""
                />
              </span>
              <span className="mobile-label">
                {isSubmitting ? 'Joining...' : 'Continue'}
              </span>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default App;
