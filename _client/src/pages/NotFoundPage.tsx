import { ToHomeButton } from '../components/ToHomeButton';
import './styles/NotFoundPage.scss';

export const NotFoundPage = () => {
  return (
    <div className="NotFoundPage">
      <h1 className="NotFoundPage__title">Page not found</h1>

      <ToHomeButton />
    </div>
  );
};
