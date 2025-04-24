import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bulma/css/bulma.min.css';
import { Root } from './modules/Root/Root';
import { Provider } from 'react-redux';
import store from './app/store';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <Root />
  </Provider>
);
