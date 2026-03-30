import { Field, Formik, Form } from 'formik';
import { useEffect, useRef } from 'react';
import cn from 'classnames';

import styles from './MessageForm.module.scss';
import { messageService } from '../../../services/messageService';
import { useChat } from '../../ChatContext';
import { catchError } from '../../../utils/catchError';
import { useError } from '../../ErrorContext';
import { validateMessage } from '../../../../utils/validators';

export const MessageForm = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { currentUser, selectedRoom } = useChat();
  const { setError } = useError();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Formik
      initialValues={{ text: '' }}
      validateOnMount
      onSubmit={({ text }, formikHelpers) => {
        formikHelpers.setSubmitting(true);

        if (currentUser && selectedRoom) {
          messageService
            .createMessage(currentUser.id, text, selectedRoom.id)
            .catch((e) => catchError(e, setError))
            .finally(() => {
              formikHelpers.setSubmitting(false);
              formikHelpers.resetForm();
              inputRef.current?.focus();
            });
        }
      }}
    >
      {({ isSubmitting, isValid, handleSubmit }) => (
        <Form className={styles.message_form}>
          <Field
            as={'textarea'}
            validate={validateMessage}
            type="text"
            name="text"
            id="text"
            placeholder="Write a message..."
            className={styles.message_field}
            innerRef={inputRef}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />

          <button
            type="submit"
            className={cn(styles.button, {
              'is-loading': isSubmitting,
              [styles.button_active]: isValid,
            })}
            disabled={isSubmitting || !isValid}
            title="Send a message"
          >
            <i className="icon fa-solid fa-paper-plane"></i>
          </button>
        </Form>
      )}
    </Formik>
  );
};
