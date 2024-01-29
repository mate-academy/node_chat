import { useNavigate } from 'react-router-dom';

import './ToHomeButton.scss';

export const ToHomeButton = () => {
  const navigate = useNavigate();

  const toHomePage = () => {
    navigate('/', { replace: true });
  };

  return (
    <button
      type="button"
      className="ToHomeButton"
      onClick={toHomePage}
    >
      Return to Home Page
    </button>
  );
};
