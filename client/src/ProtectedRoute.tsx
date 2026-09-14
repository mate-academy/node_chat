import { Navigate, Outlet } from 'react-router-dom';
import { useWebSocket } from './WebSocketContext.tsx';

const ProtectedRoute: React.FC = () => {
  const { userName } = useWebSocket();

  return userName !== '' ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
