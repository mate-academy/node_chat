import { useState } from 'react';
import { NamePage } from './pages/NamePage/NamePage.tsx';
import { RoomsPage } from './pages/RoomsPage/RoomsPage.tsx';

import './styles/index.scss';
import { Navigate, Route, Routes } from 'react-router';
import { ErrorPage } from './components/Error/Error.tsx';
import { RequireName } from './components/RequireName/RequireName.tsx';
import { RoomPage } from './pages/RoomPage/RoomPage.tsx';

function App() {
  const [name, setName] = useState(findName);

  function handleSetName(newName: string) {
    setName(newName);
    localStorage.setItem('chat-userName', newName);
  }

  function clearName() {
    setName('');
    localStorage.removeItem('chat-userName');
  }

  function findName() {
    const storedName = localStorage.getItem('chat-userName');
    if (storedName) {
      return storedName;
    }
    return '';

  }

  return (
    <Routes>
      <Route element={<RequireName name={name} />} >
        <Route path="/" element={<RoomsPage name={name} clearName={clearName} />} />
        <Route path="/rooms/:roomId" element={<RoomPage name={name} />} />
      </ Route>
      <Route path="/login" element={name ? <Navigate to="/" replace /> : <NamePage onSetName={handleSetName} />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>


  );

}

export default App
