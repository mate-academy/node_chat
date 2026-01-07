import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { AuthenticationPage } from './Pages/Authentication';
import { Lobby } from './Pages/Lobby';
import { RequireNonAuth } from './components/RequireNonAuth';
import { RequireAuth } from './components/RequireAuth';
import { RoomPage } from './Pages/RoomPage';

export const Root = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route element={<RequireAuth />}>
          <Route path="lobby" element={<Lobby />} />
          <Route path="room/:roomId" element={<RoomPage />} />
        </Route>
      </Route>
      <Route path="/" element={<RequireNonAuth />}>
        <Route path="login" element={<AuthenticationPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
