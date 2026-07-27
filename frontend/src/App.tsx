import React, { useContext, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, NavLink } from 'react-router-dom';

import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles.scss';
import './styles/index.scss';

import { AccountActivationPage } from './pages/AccountActivationPage.js';
import { AuthContext } from './contexts/AuthContext.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegistrationPage } from './pages/RegistrationPage.js';
import { RequireAuth } from './components/RequireAuth.js';
import { Loader } from './components/Loader.js';
import { HomePage } from './pages/HomePage.js';
import { usePageError } from './hooks/usePageError.js';
import { ChatPage } from './pages/ChatPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { EmailConfirmationPage } from './pages/EmailConfirmationPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { ResetPasswordPage } from './pages/ResetPasswordPage.js';

function App() {
  const navigate = useNavigate();
  const [error, setError] = usePageError('');
  const { isChecked, currentUser, logout, checkAuth } = useContext(AuthContext);

  useEffect(() => {
    checkAuth();
  }, []);

  if (!isChecked) {
    return <Loader />;
  }

  return (
    <>
      <nav
        className="navbar has-shadow"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="navbar-start">
          <NavLink to="/" className="navbar-item">
            Home
          </NavLink>

          <NavLink to="/chat" className="navbar-item">
            Chat
          </NavLink>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              {currentUser ? (
                <>
                  <Link to="/settings" className="button is-white is-rounded">
                    <span className="icon is-medium">
                      <i className="fas fa-cog fa-lg" />
                    </span>
                  </Link>
                  <button
                    className="button is-light has-text-weight-bold"
                    onClick={() => {
                      logout()
                        .then(() => {
                          navigate('/');
                        })
                        .catch((err) => {
                          setError(err.response?.data?.message);
                        });
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/sign-up"
                    className="button is-light has-text-weight-bold"
                  >
                    Sign up
                  </Link>

                  <Link
                    to="/login"
                    className="button is-success has-text-weight-bold"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="section">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="sign-up" element={<RegistrationPage />} />
            <Route
              path="activate/:activationToken"
              element={<AccountActivationPage />}
            />
            <Route path="login" element={<LoginPage />} />
            <Route
              path="confirm-email/:emailToken"
              element={<EmailConfirmationPage />}
            />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />

            <Route
              path="reset-password/:token"
              element={<ResetPasswordPage />}
            />
            <Route path="/" element={<RequireAuth />}>
              <Route path="chat" element={<ChatPage />} />
              <Route path="settings" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </section>

        {error && (
          <p className="notification is-danger is-light chatapp-error">
            {error}
          </p>
        )}
      </main>
    </>
  );
}

export default App;
