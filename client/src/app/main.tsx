import React from 'react';
import ReactDOM from 'react-dom/client'
import { Root } from './components/Root.tsx';
import { store } from './configs/reduxConfig.ts';
import { Provider } from 'react-redux'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  </Provider>
)
