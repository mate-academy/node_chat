import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/login', { replace: true }), 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="not-found">
      <h1 className="title is-2">404</h1>
      <p className="subtitle is-3">Page not found</p>
    </div>
  );
};
