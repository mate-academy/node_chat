import React, { useContext, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import cn from 'classnames';

import { AuthContext } from '../contexts/AuthContext';
import { usePageError } from '../hooks/usePageError';

interface Values {
  password: string;
  confirmPassword: string;
}

function validate(values: Values) {
  const errors: Partial<Values> = {};

  if (!values.password) {
    errors.password = 'Password is required';
  }

  if (values.password.length < 6) {
    errors.password = 'At least 6 characters';
  }

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const { resetPassword } = useContext(AuthContext);

  const [done, setDone] = useState(false);
  const [error, setError] = usePageError('');

  if (!token) {
    return null;
  }

  if (done) {
    return (
      <>
        <h1 className="title">Password changed</h1>

        <p className="mb-4">Your password was successfully changed.</p>

        <Link className="button is-success" to="/login">
          Go to login
        </Link>
      </>
    );
  }

  return (
    <>
      <Formik
        initialValues={{
          password: '',
          confirmPassword: '',
        }}
        validate={validate}
        onSubmit={(values) => {
          setError('');

          return resetPassword(token, values.password)
            .then(() => {
              setDone(true);
            })
            .catch((err) => {
              setError(err.response?.data?.message);
            });
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h1 className="title">Reset password</h1>

            <div className="field">
              <label className="label">New password</label>

              <Field
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
              Change password
            </button>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
