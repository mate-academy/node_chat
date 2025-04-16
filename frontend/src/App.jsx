import { useContext } from 'react';
import './App.css';
import { Chat } from './components/Chat/Chat.jsx';
import { UserContext } from './store/UserContext.jsx';
import { LoginForm } from './components/LoginForm';

function App() {
  const { user } = useContext(UserContext);

  if (!user) {
    return <LoginForm />;
  }

  return <Chat />;
}

export default App;
