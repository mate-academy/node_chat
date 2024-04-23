import React, { useEffect } from 'react';
import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';

import '../styles/index.scss';
import { ChatPage } from '../../pages/Chat/index.ts';
import { LoginPage } from '../../pages/Login/index.ts';
import { RegisterPage } from '../../pages/Register/index.ts';
import { Container } from 'react-bootstrap';
import { NavBar } from '../../widgets/Navbar/index.ts'
import { useAppDispatch, useAppSelector } from '../../shared/hooks/reduxHooks.ts';
import * as userAction from '../../entities/User/store/userSlice.ts';

export const Root = () => {
  const { user } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const user = localStorage.getItem('user') || null;
    if (user) {
      dispatch(userAction.setUser(JSON.parse(user)));
    }
  }, []);

  return (
    <React.StrictMode>
      <Router>
        <NavBar />
        <Container>
          <Routes>
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/chat' element={user ? <ChatPage /> : <LoginPage />} />
            <Route path='*' element={<Navigate to='/chat' />} />
          </Routes>
        </Container>
      </Router>
    </React.StrictMode>
  );
};
