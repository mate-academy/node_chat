import { useEffect, useState } from 'react';
import { NameForm } from './components/NameForm';
import { ChatRooms } from './components/ChatRooms';

const App = () => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('userName');

    if (name) {
      setUserName(name);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName])

  return (
    <div className="App">
      {userName ? (
        <ChatRooms userName={userName} />
      ) : (
        <NameForm onNameSave={setUserName} />
      )}
    </div>
  );
}

export default App;
