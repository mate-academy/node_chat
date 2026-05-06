import { createRoot } from 'react-dom/client';

import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bulma/css/bulma.css';
import './App.css';

import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);
