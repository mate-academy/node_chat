import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import 'bulma/css/bulma.min.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';


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
