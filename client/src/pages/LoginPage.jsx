import LoginForm from '../components/LoginForm';
import React from 'react';

const LoginPage = ({ onLogin }) => {
  return <LoginForm onLogin={onLogin} />;
};

export default LoginPage;
