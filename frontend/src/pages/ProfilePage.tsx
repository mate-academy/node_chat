import React, { useContext, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import cn from 'classnames';

import { AuthContext } from '../contexts/AuthContext';
import { usePageError } from '../hooks/usePageError';

interface PasswordValues {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

function validateConfirmPassword(values: PasswordValues): {
  oldPassword?: string;
  password?: string;
  confirmPassword?: string;
} {
  const errors: {
    oldPassword?: string;
    password?: string;
    confirmPassword?: string;
  } = {};

  if (
    values.oldPassword &&
    values.password &&
    values.oldPassword === values.password
  ) {
    errors.oldPassword = 'New password must be different from old password';
  }

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}

function validatePassword(value: string) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

function validateEmail(value: string) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

export const ProfilePage = () => {
  const { currentUser, updateUsername, updatePassword, updateEmail } =
    useContext(AuthContext);

  const [error, setError] = usePageError('');

  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [emailChanged, setEmailChanged] = useState(false);

  return (
    <>
      <h1 className="title">Profile</h1>

      {/* Change username */}
      <Formik
        initialValues={{
          username: currentUser?.username || '',
        }}
        onSubmit={({ username }) => {
          setUsernameSuccess('');
          setError('');

          return updateUsername(
            currentUser?.id ? currentUser.id : '0',
            username,
          )
            .then(() => {
              setUsernameSuccess('Username updated successfully');
            })
            .catch((err) => {
              setError(err.response?.data?.message);
            });
        }}
      >
        {({ isSubmitting }) => (
          <Form className="box">
            <h2 className="subtitle">Change Username</h2>

            <div className="field">
              <label className="label">Username</label>

              <div className="control">
                <Field name="username" type="text" className="input" />
              </div>
            </div>

            <button
              type="submit"
              className={cn('button is-success', {
                'is-loading': isSubmitting,
              })}
            >
              Save name
            </button>

            {usernameSuccess && (
              <p className="help is-success">{usernameSuccess}</p>
            )}
          </Form>
        )}
      </Formik>

      {/* Change password */}
      <Formik
        initialValues={{
          oldPassword: '',
          password: '',
          confirmPassword: '',
        }}
        validate={validateConfirmPassword}
        onSubmit={(values, { resetForm }) => {
          setPasswordSuccess('');
          setError('');

          return updatePassword(
            currentUser?.id ? currentUser.id : '0',
            values.oldPassword,
            values.password,
          )
            .then(() => {
              setPasswordSuccess('Password updated successfully');
              resetForm();
            })
            .catch((err) => {
              setError(err.response?.data?.message);
            });
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h2 className="subtitle">Change password</h2>

            <div className="field">
              <label className="label">Old password</label>

              <Field
                name="oldPassword"
                type="password"
                className={cn('input', {
                  'is-danger': touched.oldPassword && errors.oldPassword,
                })}
              />

              {touched.oldPassword && errors.oldPassword && (
                <p className="help is-danger">{errors.oldPassword}</p>
              )}
            </div>

            <div className="field">
              <label className="label">New password</label>

              <Field
                validate={validatePassword}
                name="password"
                type="password"
                className={cn('input', {
                  'is-danger': touched.password && errors.password,
                })}
              />

              {touched.password && errors.password && (
                <p className="help is-danger">{errors.password}</p>
              )}
            </div>

            <div className="field">
              <label className="label">Confirm password</label>

              <Field
                name="confirmPassword"
                type="password"
                className={cn('input', {
                  'is-danger':
                    touched.confirmPassword && errors.confirmPassword,
                })}
              />

              {touched.confirmPassword && errors.confirmPassword && (
                <p className="help is-danger">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              className={cn('button is-success', {
                'is-loading': isSubmitting,
              })}
            >
              Save password
            </button>

            {passwordSuccess && (
              <p className="help is-success">{passwordSuccess}</p>
            )}
          </Form>
        )}
      </Formik>

      {/* Change email */}
      <Formik
        initialValues={{
          password: '',
          newEmail: '',
        }}
        onSubmit={(values, { resetForm }) => {
          setError('');

          return updateEmail(
            currentUser?.id ? currentUser.id : '0',
            values.password,
            values.newEmail,
          )
            .then(() => {
              setEmailChanged(true);
              resetForm();
            })
            .catch((err) => {
              setError(err.response?.data?.message);
            });
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h2 className="subtitle">Change email</h2>

            <div className="field">
              <label className="label">Current password</label>

              <Field
                name="password"
                type="password"
                className={cn('input', {
                  'is-danger': touched.password && errors.password,
                })}
              />
            </div>

            <div className="field">
              <label className="label">New email</label>

              <Field
                validate={validateEmail}
                name="newEmail"
                type="email"
                className={cn('input', {
                  'is-danger': touched.newEmail && errors.newEmail,
                })}
              />

              {touched.newEmail && errors.newEmail && (
                <p className="help is-danger">{errors.newEmail}</p>
              )}
            </div>

            {emailChanged && (
              <p className="help mb-4">
                A confirmation link will be sent to your new email. Your old
                email will also receive a notification about this change.
              </p>
            )}

            <button
              type="submit"
              className={cn('button is-link', {
                'is-loading': isSubmitting,
              })}
            >
              Change email
            </button>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
