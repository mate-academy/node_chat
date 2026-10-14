// eslint-disable-next-line
import type React from 'react';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { Navigate } from 'react-router';
import { ChatPage } from '../../pages/ChatPage/ChatPage';

export const ProtectedChat: React.FC = () => {
  const { userName } = useContext(UserContext);

  if (!userName) {
    return (
      <Navigate to='/' replace />
    );
  }

  return <ChatPage />;
};
