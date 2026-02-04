import { useState } from 'react';
import { Login } from './pages/Login';
import { useEffect } from 'react';
import { Chat } from './pages/Chat';

function App() {
  const [isUser, setIsUser] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const username = localStorage.getItem('username');
      if (username) {
        setIsUser(true);
        setCurrentUsername(username);
      } else {
        setIsUser(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsUser(true);
    const username = localStorage.getItem('username');
    setCurrentUsername(username);
  };

  return (
    <>
      <div className="App">
        {isUser ? (
          <Chat currentUsername={currentUsername} />
        ) : (
          <Login onLoginSuccess={handleLogin} />
        )}
      </div>
    </>
  );
}

export default App;
