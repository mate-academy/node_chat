import { createRoot } from 'react-dom/client';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';

import { App } from './App';
import { LoginPage } from './pages/LoginPage';
import { RequireNonAuth } from './components/RequireNonAuth';
import { RequireAuth } from './components/RequireAuth';
import { ChatPage } from './pages/ChatPage/ChatPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Room } from './components/Room';
import { JoinToRoomModal } from './components/Modal/JoinToRoomModal';
import { ErrorProvider } from './components/ErrorContext';
import { RoomSettingsModal } from './components/Modal/RoomSettingsModal';
import { RenameModal } from './components/Modal/RenameModal';
import { ChatProvider } from './components/ChatContext';
import { DeleteModal } from './components/Modal/DeleteModal';
import { SettingsOptions } from './components/Modal/SettingsOptions';
import { LeaveModal } from './components/Modal/LeaveModal';

export const Root = () => (
  <ErrorProvider>
    <ChatProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />}>
            <Route element={<RequireAuth />}>
              <Route path="/" element={<Navigate to="/rooms" replace />} />
              <Route path="rooms" element={<ChatPage />}>
                <Route path="add/:addMode" element={<JoinToRoomModal />} />
                <Route path=":roomId" element={<Room />}>
                  <Route path="settings" element={<RoomSettingsModal />}>
                    <Route index element={<SettingsOptions />} />
                    <Route path="rename" element={<RenameModal />} />
                    <Route path="delete" element={<DeleteModal />} />
                    <Route path="leave" element={<LeaveModal />} />
                  </Route>
                </Route>
              </Route>
            </Route>

            <Route element={<RequireNonAuth />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </ChatProvider>
  </ErrorProvider>
);

createRoot(document.getElementById('root')!).render(<Root />);
