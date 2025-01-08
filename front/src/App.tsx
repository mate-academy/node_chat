import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { AuthComponent } from './components/AuthComponent';
import ChatApp from './components/ChatApp';
import { useUser } from './context/UserContext';
import { useEffect } from 'react';
import { userService } from './services/userService';
import { RequireAuth } from './components/RequireAuth';
import RegisterComponent from './components/RegisterComponent';
import { socket } from './services/socketService';

const App: React.FC = () => {
  const { user, setUser } = useUser();
  const isLoading = user === undefined;
  console.log(user);

  useEffect(() => {
    userService
      .getUserInfo()
      .then((user) => {
        setUser(user);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  useEffect(() => {
    if (user) {
      socket.send(
        JSON.stringify({
          id: user?.id,
          type: 'CONNECT',
        }),
      );
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="has-text-centered p-6">
        <button
          className="button is-loading is-large is-light"
          style={{ border: 'none', background: 'transparent' }}
        >
          Завантаження...
        </button>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth/login" element={<AuthComponent />} />
        <Route path="/auth/register" element={<RegisterComponent />} />
        <Route
          path="/chats"
          element={
            <RequireAuth>
              <ChatApp />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/auth/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
