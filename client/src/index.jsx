import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { NotFoundPage } from './pages/notFoundPage.jsx';
import './input.css';
import { ContextProvider } from './context/context.jsx';
import { Room } from './pages/room.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ContextProvider>
    <Router>
      <Routes>
        <Route path="/" element={<App />}></Route>
        <Route path="/room/:roomId" element={<Room />}></Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  </ContextProvider>,
);
