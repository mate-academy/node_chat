import { useContext } from 'react';
import { userService } from '../services/userService.js';
import { Formik, Form, Field } from 'formik';
import { Context } from '../context/context.jsx';
import { useNavigate } from 'react-router-dom';
import { ErrorHandler } from './ErrorHandler.jsx';

function chatNameValidation(newChatName) {
  if (!newChatName || newChatName.trim().length === 0) {
    return 'Chat name required';
  }

  if (newChatName.trim().length < 2) {
    return 'Chat name is too short';
  }

  if (newChatName.length > 30) {
    return 'Less than 30 characters required';
  }

  return null;
}

export const ChatBlock = () => {
  const { setCurrentRoom, user, anyError, setAnyError, allChats, setAllChats } =
    useContext(Context);
  const navigate = useNavigate();

  function handleJoinButton(chat) {
    userService
      .joinRoom(chat.id)
      .then((res) => {
        setCurrentRoom(res);
        navigate(`/room/${chat.id}`);
      })
      .catch((error) => {
        if (error.message) {
          setAnyError(error.message);
        }

        if (!error.response?.data) {
          return;
        }

        if (error.response?.data.error) {
          setAnyError(error.response?.data.error);
        }

        const { message } = error.response.data;

        if (message) {
          setAnyError(message);
        }
      });
  }

  function handleDeleteButton(chat) {
    userService
      .deleteRoom(chat.id)
      .then(setAllChats)
      .catch((error) => {
        if (error.message) {
          setAnyError(error.message);
        }

        if (!error.response?.data) {
          return;
        }

        if (error.response?.data.error) {
          setAnyError(error.response?.data.error);
        }

        const { message } = error.response.data;

        if (message) {
          setAnyError(message);
        }
      });
  }

  return (
    <div className="w-full flex flex-col">
      <div className="flex justify-between mb-3">
        <div className="flex gap-6 items-center">
          <h3>Available chats</h3>
        </div>

        <div>
          <Formik
            initialValues={{ newChatName: '' }}
            validateOnMount={true}
            onSubmit={({ newChatName }, formikHelpers) => {
              formikHelpers.setSubmitting(true);
              formikHelpers.resetForm();

              userService
                .createNewChat(newChatName, user)
                .then((res) => {
                  setAllChats(res);
                })
                .catch((error) => {
                  if (error.message) {
                    setAnyError(error.message);
                  }

                  if (!error.response?.data) {
                    return;
                  }

                  const { errors, message } = error.response.data;

                  formikHelpers.setFieldError(
                    'newChatName',
                    errors?.newChatName,
                  );

                  if (message) {
                    setAnyError(message);
                  }
                })
                .finally(() => formikHelpers.setSubmitting(false));
            }}
          >
            {({ touched, errors, isSubmitting, resetForm, values }) => (
              <Form className="flex items-center h-8">
                <div className="h-full">
                  <div>
                    <Field
                      className="h-8 rounded-xl border-2 p-2"
                      validate={chatNameValidation}
                      name="newChatName"
                      type="text"
                      id="newChatName"
                      placeholder="Chat name"
                      disabled={!user}
                    />
                  </div>

                  <ErrorHandler
                    touched={touched.newChatName}
                    error={errors.newChatName}
                  />
                </div>

                <div className="h-full">
                  <button
                    className="w-40 h-full bg-slate-300 mx-1"
                    type="submit"
                    disabled={
                      isSubmitting ||
                      errors.newChatName ||
                      !values.newChatName ||
                      !user
                    }
                  >
                    Create new chat
                  </button>

                  <button
                    className="w-40 h-full bg-blue-500 mx-1"
                    onClick={() => resetForm()}
                    type="button"
                    disabled={isSubmitting || !values.newChatName}
                  >
                    Clear
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {anyError && <p style={{ color: 'red', marginTop: '5px' }}>{anyError}</p>}

      <div className="border-solid border-2 w-full h-70vh p-3 overflow-y-scroll">
        {allChats.map((chat) => {
          return (
            <div
              key={chat.id}
              className="px-3 h-10 rounded-xl flex justify-between items-center mb-2 bg-slate-400"
            >
              <div className="flex items-center">
                <p className="font-bold text-xl mr-4">{chat.name}</p>
                {chat.creator && (
                  <p className="text-gray-500">{`created by "${chat.creator}"`}</p>
                )}
              </div>

              <div className="flex h-8">
                {chat.creator && (
                  <Formik
                    initialValues={{ renameValue: '' }}
                    validateOnMount={true}
                    onSubmit={({ renameValue }, formikHelpers) => {
                      formikHelpers.setSubmitting(true);
                      formikHelpers.resetForm();

                      userService
                        .renameRoom(renameValue, chat.id)
                        .then((res) => {
                          setAllChats(res);
                        })
                        .catch((error) => {
                          if (error.message) {
                            setAnyError(error.message);
                          }

                          if (!error.response?.data) {
                            return;
                          }

                          const { errors, message } = error.response.data;

                          formikHelpers.setFieldError(
                            'renameValue',
                            errors?.renameValue,
                          );

                          if (message) {
                            setAnyError(message);
                          }
                        })
                        .finally(() => formikHelpers.setSubmitting(false));
                    }}
                  >
                    {({ touched, errors, isSubmitting, resetForm, values }) => (
                      <Form className="flex items-center h-8">
                        <div className="relative">
                          <div>
                            <Field
                              className="h-full rounded-xl border-2 p-2 w-40"
                              validate={chatNameValidation}
                              name="renameValue"
                              type="text"
                              id="renameValue"
                              placeholder="new name for the chat"
                              disabled={!user}
                            />
                          </div>

                          <ErrorHandler
                            touched={touched.renameValue}
                            error={errors.renameValue}
                          />
                        </div>

                        <div className="h-full">
                          <button
                            className="mx-1 w-20 bg-yellow-400 h-full"
                            type="submit"
                            disabled={
                              isSubmitting ||
                              errors.renameValue ||
                              !values.renameValue ||
                              !user
                            }
                          >
                            Rename
                          </button>

                          <button
                            className="mx-1 w-20 bg-blue-600 h-full "
                            onClick={() => resetForm()}
                            type="button"
                            disabled={isSubmitting || !values.renameValue}
                          >
                            Clear
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                )}

                {chat.creator && (
                  <button
                    onClick={() => handleDeleteButton(chat)}
                    disabled={!user}
                    className=" mx-1 w-20 bg-red-600 h-full"
                  >
                    Delete
                  </button>
                )}

                <button
                  onClick={() => handleJoinButton(chat)}
                  className="mx-1 w-20 bg-green-600"
                  type="submit"
                  disabled={!user}
                >
                  Join
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
