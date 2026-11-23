import { useState } from 'react';
import { Layout } from './layout';
import { RoomChat } from './components/RoomChat/RoomChat';
import { RoomsList } from './components/RoomsList';
import { UserNameForm } from './components/UserNameForm';
import { WebSocketProvider } from './context/WebSocketProvider';
import { useAppSelector } from './store/hooks';

export function App() {
  const [username, setUsername] = useState(
    () => localStorage.getItem('username') || '',
  );

  const currentRoom = useAppSelector((state) => state.currentRoom.currentRoom);

  function handleSetUsername(name: string) {
    const normalizedName = name.trim();

    if (!normalizedName) {
      return;
    }

    localStorage.setItem('username', normalizedName);
    setUsername(normalizedName);
  }

  if (!username) {
    return <UserNameForm setUsername={handleSetUsername} />;
  }

  return (
    <WebSocketProvider username={username}>
      <section className="section">
        <div className="container">
          <h1 className="title has-text-centered mb-5">Chat application</h1>

          <Layout>
            {currentRoom ? <RoomChat /> : <RoomsList />}
          </Layout>
        </div>
      </section>
    </WebSocketProvider>
  );
}
