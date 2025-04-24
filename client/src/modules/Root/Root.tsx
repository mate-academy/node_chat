import React from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { HomePage } from '../HomePage';
import { App } from '../App';
import { RegistrationPage } from '../RegistrationPage';
import { ActivationPage } from '../ActivationPage';
import { LoginPage } from '../LoginPage';
import { ProtectedRoutes } from '../../components/ProtectedRoutes';
import { AccountPage } from '../AccountPage/AccountPage';
import { PasswordResetPage } from '../PasswordResetPage';
import { NewPasswordPage } from '../NewPasswordPage';
import { ChatRoomsPage } from '../ChatRoomsPage';
import { ChatRoomPage } from '../ChatRoomPage';

export const Root = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />

          <Route path="/home" element={<Navigate to="/" replace />} />

          <Route path="/activate/:token" element={<ActivationPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/password-reset" element={<PasswordResetPage />} />

          <Route path="/password-reset/:token" element={<NewPasswordPage />} />

          <Route element={<ProtectedRoutes />}>
            <Route path="/account" element={<AccountPage />} />

            <Route path="/rooms" element={<ChatRoomsPage />} />

            <Route path="/room/:name" element={<ChatRoomPage />} />
          </Route>

          <Route path="/signup" element={<RegistrationPage />} />
        </Route>

        <Route path="*" element={<p>PAGE NOT FOUND</p>} />
      </Routes>
    </Router>
  );
};
