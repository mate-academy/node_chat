import {
  HashRouter as Router, Routes, Route,
} from 'react-router-dom';

import { ChatPage } from './pages/ChatPage/ChatPage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { AppProvider } from './store/AppContext';
import { LoginRequire } from './components/LoginRequire/LoginRequire';
import { PageRoute } from 'types/PageRoutes';

export const Root = () => (
  <Router>
    <AppProvider>
      <Routes>
        <Route path={PageRoute.NONE} element={<LoginRequire />}>
          <Route index element={<ChatPage />} />
        </Route>
        <Route path={PageRoute.LOGIN} element={<LoginPage />} />
        {/* <Route index element={<HomePage />} /> */}
        {/* <Route path="home" element={<Navigate to="/" replace />} /> */}
        <Route path={PageRoute.CHAT} element={<ChatPage />} />
        <Route path={PageRoute.UNKNOWN} element={<h1 className="title">Page not found</h1>} />
      </Routes>
    </AppProvider>
  </Router>
);
