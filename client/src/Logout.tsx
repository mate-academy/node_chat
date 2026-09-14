import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useWebSocket } from './WebSocketContext.tsx';

const Logout: React.FC = () => {
  const { logout } = useWebSocket();

  useEffect(() => {
    logout();
  }, [logout]);

  return <Navigate to="/login" replace />;
};

export default Logout;
