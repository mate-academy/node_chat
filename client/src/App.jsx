import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import MainPage from './pages/MainPage';
import AuthPage from './pages/AuthPage';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('chat_user');

    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            !user ? <AuthPage onLoginSuccess={setUser} /> : <Navigate to="/" />
          }
        />

        <Route
          path="/"
          element={
            user ? (
              <MainPage
                currentUser={user}
                onLogout={() => {
                  localStorage.removeItem('chat_user');
                  setUser(null);
                }}
              />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
