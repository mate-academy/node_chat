import { useContext } from 'react';
import styles from './App.module.scss';
import { UserContext } from './Context/UserContext';
import { Header } from './components/Header';
import { Navigate, Outlet } from 'react-router-dom';

export const App = () => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  );
};
