import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { UsernameProvider } from './context/UsernameContext.tsx';
import { SocketProvider } from './context/SocketContext.tsx';
import './index.css';
import './styles/fonts.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <UsernameProvider>
      <StrictMode>
        <SocketProvider>
          <App />
        </SocketProvider>
      </StrictMode>
    </UsernameProvider>
  </BrowserRouter>,
);
