import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { userLogout } from '../../api/auth/userLogout';
import * as authActions from '../../features/authentication';

export const NavBar = () => {
  const dispatch = useAppDispatch();
  const navgate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    onLinkClick();
  }, [location]);

  useEffect(() => {
    window.addEventListener('resize', function () {
      if (document.body.clientWidth > 1024) {
        setMobileMenuVisible(false);
      }
    });
  }, []);

  function onLinkClick() {
    setMobileMenuVisible(false);
  }

  function handleLogout() {
    userLogout().then(() => {
      dispatch(authActions.actions.logout());
      navgate('/');
    });
  }

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link className="navbar-item" to="/">
          <img src="/logo.svg" height="28" width="64" />
        </Link>

        <div
          role="button"
          className="navbar-burger has-text-primary"
          aria-label="menu"
          aria-expanded="false"
          onClick={() => setMobileMenuVisible((prev) => !prev)}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </div>
      </div>

      <div
        id="navbarBasicExample"
        className={classNames('navbar-menu', {
          'is-active': mobileMenuVisible,
        })}
      >
        <div className="navbar-start">
          <Link className="navbar-item" to="/">
            Home
          </Link>
          <Link
            className={classNames('navbar-item', {
              'is-hidden': !isAuthenticated,
            })}
            to="/account"
          >
            Account
          </Link>
          <Link className="navbar-item" to="/rooms">
            Chat Rooms
          </Link>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              <Link
                className={classNames('button is-primary', {
                  'is-hidden': isAuthenticated,
                })}
                to="/signup"
              >
                <strong>Sign up</strong>
              </Link>
              <Link
                className={classNames('button is-light', {
                  'is-hidden': isAuthenticated,
                })}
                to="/login"
              >
                Log in
              </Link>
              <div
                className={classNames('button is-light', {
                  'is-hidden': !isAuthenticated,
                })}
                onClick={() => handleLogout()}
              >
                Log out
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
