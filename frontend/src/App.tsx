import { Route, Routes, Navigate } from 'react-router-dom';
import './App.scss';
import Login from './components/Login/Login';
import Registration from './components/Registration/Registration';
import ChatApp from './components/Chat/ChatApp';
import { useUserStore } from './store/store';
import type React from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthRouteProps {
  children: React.ReactNode;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const token = useUserStore((state) => state.token);

  if (isAuthenticated && token) {
    try {
      const decodedToken: { id?: string } = jwtDecode(token);
      const userId = decodedToken.id;

      if (userId) {
        return <Navigate to={`/chat/${userId}`} replace />;
      } else {
        console.warn(
          "Authenticated, but 'id' claim not found in token payload for redirection.",
        );

        return <Navigate to="/login" replace />;
      }
    } catch (error) {
      console.error('Failed to decode token during AuthRoute check:', error);

      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />

      <Route
        path="/register"
        element={
          <AuthRoute>
            <Registration />
          </AuthRoute>
        }
      />

      <Route
        path="/chat/:userId"
        element={
          <ProtectedRoute>
            <ChatApp />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
