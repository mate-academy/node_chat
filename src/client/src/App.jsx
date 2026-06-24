import { useState, useEffect } from 'react';
import './App.css';
import { MessageForm } from './MessageForm.jsx';
import { MessageList } from './MessageList.jsx';
import { NameForm } from './NameForm.jsx';

const DataLoader = ({ onData }) => {
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3000/message');

    eventSource.onmessage = (event) => {
      onData(JSON.parse(event.data));
    };

    return () => eventSource.close();
  }, []);

  return <h1 className="title">Server Sent Events</h1>;
};

export function App() {
  const [messages, setMessages] = useState([]);

  const [username, setUsername] = useState(
    () => localStorage.getItem('username') || '',
  );

  function saveData(message) {
    setMessages((current) => [...current, message]);
  }

  function handleLogin(name) {
    localStorage.setItem('username', name);
    setUsername(name);
  }

  return (
    <section className="section content">
      <DataLoader onData={saveData} />

      {!username ? (
        <NameForm onSubmit={handleLogin} />
      ) : (
        <>
          <MessageForm username={username} />
          <MessageList messages={messages} />
        </>
      )}
    </section>
  );
}
