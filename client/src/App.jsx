// #region imports 
import { useState } from 'react';
import './App.css'
import { MessageForm } from './MessageForm.jsx';
import { MessageList } from './MessageList.jsx';
// #endregion

const DataLoader = () => {
  return (
    <h1 className="title">Chat application</h1>
  );
};

export function App() {
  const [messages, setMessages] = useState([]);

  function saveData(message) {
    // update messages here
  }

  return (
    <section className="section content">
      <DataLoader onData={saveData} />

      <MessageForm />
      <MessageList messages={messages} />
    </section>
  )
}
