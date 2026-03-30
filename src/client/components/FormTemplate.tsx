import { Formik, Form, Field } from 'formik';
import React, { useEffect, useRef } from 'react';
import cn from 'classnames';
import { useNavigate } from 'react-router-dom';

import { Fields, FormTitle, inputParams } from '../types/Fields';
import { SubmitCallback } from '../types/SubmitCallback';

type Props = {
  fields: Fields;
  onSubmit: SubmitCallback;
  formTitle?: FormTitle;
  removeCancelButton?: boolean;
  submitButtonName?: string;
  children?: React.ReactNode;
  cancelCallback?: () => void;
};

export const FormTemplate: React.FC<Props> = ({
  fields,
  onSubmit,
  formTitle,
  removeCancelButton = false,
  submitButtonName = 'Submit',
  children,
  cancelCallback,
}) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Formik
      initialValues={Object.fromEntries(
        Object.entries(fields).map(([name, field]) => [
          name,
          field.initialValue ?? '',
        ]),
      )}
      validateOnMount
      onSubmit={onSubmit}
    >
      {({ touched, errors, isSubmitting, isValid }) => (
        <Form className="box">
          {formTitle && (
            <h2 className={`title is-${formTitle.size || 3}`}>
              {formTitle.text}
            </h2>
          )}

          {Object.entries(fields).map(([name, field], index) => {
            return (
              <div className="field" key={name}>
                <label htmlFor={name} className="label">
                  {field.label}
                </label>

                <div className="control has-icons-left has-icons-right">
                  <Field
                    validate={inputParams[name].validator}
                    name={name}
                    type={field.type}
                    id={name}
                    placeholder={inputParams[name].placeholder}
                    className={cn('input', {
                      'is-danger': touched[name] && errors[name],
                    })}
                    innerRef={index === 0 ? inputRef : undefined}
                  />

                  <span className="icon is-small is-left">
                    <i className={inputParams[name].icon}></i>
                  </span>

                  {touched[name] && errors[name] && (
                    <span className="icon is-small is-right has-text-danger">
                      <i className="fas fa-exclamation-triangle"></i>
                    </span>
                  )}
                </div>

                {touched[name] && errors[name] && (
                  <p className="help is-danger">{errors[name]}</p>
                )}
              </div>
            );
          })}

          <div className="field buttons">
            <button
              type="submit"
              className={cn('button is-success has-text-weight-bold', {
                'is-loading': isSubmitting,
              })}
              disabled={isSubmitting || !isValid}
            >
              {submitButtonName}
            </button>

            {!removeCancelButton && (
              <button
                className="button"
                type="button"
                onClick={cancelCallback || (() => navigate(-1))}
              >
                Cancel
              </button>
            )}
          </div>
          {children}
        </Form>
      )}
    </Formik>
  );
};
