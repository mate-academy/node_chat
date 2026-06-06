import './App.css';
import { Route, Routes } from 'react-router';
import { JoinPage } from './pages/JoinPage';
import { ChatPage } from './pages/ChatPage';
import { useContext } from 'react';
import { UsernameContext } from './context/UsernameContext';

function App() {
  const { username } = useContext(UsernameContext);

  return (
    <main className="main">
        <Routes>
          <Route
            path="/"
            element={username ? <ChatPage /> : <JoinPage />}
          />
          <Route
            path="chat"
            element={username ? <ChatPage /> : <JoinPage />}
          />
        </Routes>
    </main>
  );
}

export default App;
