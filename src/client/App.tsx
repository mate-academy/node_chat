import { Outlet } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bulma/css/bulma.css';

import './styles.scss';
import { useError } from './components/ErrorContext';

export const App = () => {
  const { error } = useError();

  return (
    <div className="section" data-theme="dark">
      <Outlet />
      {error && <p className="notification is-danger is-dark">{error}</p>}
    </div>
  );
};
