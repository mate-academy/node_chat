import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import './App.css';

import { App } from './App';
import { store } from './store';

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
