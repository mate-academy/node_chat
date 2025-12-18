import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import {BrowserRouter as  Router } from 'react-router';
import { AuthProvider } from './components/AuthProvider.tsx';
const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <AuthProvider>
  <Router>
    <App />
    </Router>
  </AuthProvider>
  
);
