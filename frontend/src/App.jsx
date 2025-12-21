// #region imports 
import { useState } from 'react';
import './App.css'
import { MessageForm } from './components/MessageForm.jsx';
import { MessageList } from './components/MessageList.jsx';
import { useAuth } from './contexts/AuthContext.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { Routes, Route } from 'react-router-dom';
import { RoomsList } from './components/RoomsList.tsx';
import { DataLoader } from './components/DataLoader.tsx';
// #endregion

export function App() {
  const [messages, setMessages] = useState([]);
  const { userName } = useAuth();

  function saveData(message) {
    setMessages(messages => [message, ...messages]);
  }



  if (!userName) {
    return <AuthPage />;
  }

  return (
    <section className="section content">
      <Routes>
        <Route path='/' element={<DataLoader onMessage={saveData} initMessages={setMessages} />}>
          <Route index element={<RoomsList />} />
          <Route path=':roomId' element={
            <>
              <MessageForm />
              <MessageList messages={messages} />
            </>
          } />
        </Route>
      </Routes>
    </section >
  )
}
