import { useCallback, useEffect, useState } from 'react';
import { Entrance } from './components/Enterence';
import { socket } from './api/socket';
import { Messenger } from './components/Messenger';

function App() {
  const [isEntered, setIsEntered] = useState(
    !!localStorage.getItem('username') || false,
  );
  const [username, setUsername] = useState(
    localStorage.getItem('username') || '',
  );

  useEffect(() => {
    if (isEntered && username) {
      socket.connect();
      socket.emit('JoinToNetwork', { username });
    }

    return () => {
      socket.disconnect();
    };
  }, [isEntered, username]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value),
    [],
  );

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (username.trim()) {
        localStorage.setItem('username', username);
        setIsEntered(true);
      }
    },
    [username],
  );

  return (
    <div className="h-screen flex justify-center items-center min-h-screen bg-slate-800 text-slate-300 ">
      {!isEntered && (
        <Entrance username={username} onChange={onChange} onSubmit={onSubmit} />
      )}

      {isEntered && <Messenger username={username} />}
    </div>
  );
}

export default App;
