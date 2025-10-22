import { useState } from 'react';
import './styles/App.scss';
import { Dashboard } from './components/Dashboard';

function App() {
  const [username, setUsername] = useState('');
  const [sessionUsername, setSessionUsername] = useState(
    localStorage.getItem('username'),
  );

  const submitUsername = (e) => {
    e.preventDefault();
    localStorage.setItem('username', username);
    setSessionUsername(username);
  };

  return (
    <main className="container">
      <h1 className="title is-1 has-text-centered">Node chat</h1>
      {sessionUsername ? (
        <Dashboard username={sessionUsername} />
      ) : (
        <form id="login" onSubmit={submitUsername}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input is-medium"
            type="text"
            placeholder="Enter username"
          />
          <button className="button is-dark" type="submit">
            Enter
          </button>
        </form>
      )}
    </main>
  );
}

export default App;
