import { useEffect, useState } from 'react';
import { api, ApiError } from './api';
import { UsernameForm } from './components/UsernameForm';
import { Chat } from './components/Chat';

const STORAGE_KEY = 'username';

function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [checking, setChecking] = useState(
    () => localStorage.getItem(STORAGE_KEY) !== null,
  );

  // If a name was saved earlier, check that the server still knows it
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return;
    }

    api
      .getUser(saved)
      .then(() => setUsername(saved))
      .catch((error) => {
        if (error instanceof ApiError && error.status === 404) {
          localStorage.removeItem(STORAGE_KEY);
        }
      })
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = async (name: string) => {
    const user = await api.createUser(name);

    localStorage.setItem(STORAGE_KEY, user.username);
    setUsername(user.username);
  };

  if (checking) {
    return <p>Loading...</p>;
  }

  if (!username) {
    return <UsernameForm onSubmit={handleLogin} />;
  }

  return <Chat username={username} />;
}

export default App;
