import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Chats from './pages/Chats.tsx';
import Rooms from './pages/Rooms/Rooms.tsx';
import App from './App.tsx';
import { WebSocketProvider } from './WebSocketContext.tsx';
import Login from './pages/Login.tsx';
import ProtectedRoute from './ProtectedRoute.tsx';
import Logout from './Logout.tsx';

export default function Root() {
  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route index element={<Chats />} />
              <Route path="rooms" element={<Rooms />} />
              <Route path="logout" element={<Logout />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  );
}
