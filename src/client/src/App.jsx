import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { MessageForm } from './MessageForm.jsx';
import { MessageList } from './MessageList.jsx';
import { NameForm } from './NameForm.jsx';

const API_URL = 'http://127.0.0.1:3000/messages';

function getMessages() {
  return axios.get(API_URL).then((res) => res.data);
}

const DataLoader = ({ onData }) => {
  useEffect(() => {
    getMessages().then(onData);

    const timerId = setInterval(() => {
      getMessages().then(onData);
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  return <h1 className="title">Short polling</h1>;
};

export function App() {
  const [messages, setMessages] = useState([]);

  const [username, setUsername] = useState(
    () => localStorage.getItem('username') || '',
  );

  function saveData(messages) {
    setMessages(messages);
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
