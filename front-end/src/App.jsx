import { useState } from 'react';
import './App.css';
import { AppProvider } from './context/AppContext';
import { Navigate, Route, Routes } from 'react-router';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/MainPage/HomePage';

function App() {
  return (
    <div className="App">
      <AppProvider>
        <main className="main">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/rooms" element={<HomePage />} />
          </Routes>
        </main>
      </AppProvider>
    </div>
  );
}

export default App;
