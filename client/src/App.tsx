import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import { Loader } from './components/Loader/Loader';
import { ChatsPage, NotFoundPage, SignInPage, SignUpPage, ChatPage } from './routing/routes';
import { ChatForm } from './components/Chat/ChatForm';
import ProtectedRoute from './routing/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthRoute from './routing/AuthRoute';
import { UserProvider } from './providers/UserProvider';

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <UserProvider>
        <ToastContainer />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path='/' element={<ChatsPage />} />

              <Route path='/chat' element={<ChatsPage />}>
                <Route path=':chatid?' element={<ChatPage />} />
                <Route index path='create' element={<ChatForm />} />
                <Route index element={<div>No selected chat</div>} />
              </Route>
            </Route>

            <Route element={<AuthRoute />}>
              <Route path='/signin' element={<SignInPage />} />
              <Route path='/signup' element={<SignUpPage />} />
            </Route>

            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </UserProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
