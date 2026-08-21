import React, { useContext, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import cn from 'classnames';

import { AuthContext } from '../contexts/AuthContext';
import { usePageError } from '../hooks/usePageError';

function validateEmail(value: string) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

export const ForgotPasswordPage = () => {
  const { forgotPassword } = useContext(AuthContext);

  const [sent, setSent] = useState(false);
  const [error, setError] = usePageError('');

  if (sent) {
    return (
      <>
        <h1 className="title">Check your email</h1>
        <p>We have sent you a password reset link.</p>
      </>
    );
  }

  return (
    <>
      <Formik
        initialValues={{
          email: '',
        }}
        onSubmit={({ email }) => {
          setError('');

          return forgotPassword(email)
            .then(() => {
              setSent(true);
            })
            .catch((err) => {
              setError(err.response?.data?.message);
            });
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h1 className="title">Password recovery</h1>

            <div className="field">
              <label className="label">Email</label>

              <Field
                validate={validateEmail}
                name="email"
                type="email"
                className={cn('input', {
                  'is-danger': touched.email && errors.email,
                })}
              />

              {touched.email && errors.email && (
                <p className="help is-danger">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              className={cn('button is-success', {
                'is-loading': isSubmitting,
              })}
            >
              Send reset link
            </button>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
