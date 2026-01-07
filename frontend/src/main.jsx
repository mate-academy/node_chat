import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { UserProvider } from './Context/UserContext';
import { RoomsProvider } from './Context/RoomsContext';
import { Root } from './Root';

createRoot(document.getElementById('root')).render(
  <UserProvider>
    <RoomsProvider>
      <Root />
    </RoomsProvider>
  </UserProvider>,
);
