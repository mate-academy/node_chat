import { useContext, useEffect, useState } from 'react';
import { Context } from '../context/context.jsx';
import { Formik, Form, Field } from 'formik';
import { userService } from '../services/userService.js';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatBlock } from './ChatsBlock.jsx';

function messageValidation(newMessage) {
  if (newMessage.trim().length > 300) {
    return 'Message is too long';
  }

  return null;
}

export const Room = () => {
  const {
    currentRoom,
    setCurrentRoom,
    setUser,
    user,
    setAllChats,
    setAnyError,
    sendMessage,
  } = useContext(Context);

  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const { roomId } = useParams();

  useEffect(() => {
    const storedUser = localStorage.getItem('nickname');

    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    userService
      .getAllChats()
      .then(setAllChats)
      .catch((error) => {
        if (error.message) {
          setAnyError(error.message);
        }

        if (!error.response?.data) {
          return;
        }

        const { message } = error.response.data;

        if (message) {
          setAnyError(message);
        }
      });
  }, []);

  useEffect(() => {
    userService
      .joinRoom(roomId)
      .then((res) => {
        setCurrentRoom(res);
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
  }, []);

  function handleLogOut() {
    localStorage.setItem('nickname', '');
    setUser('');
    navigate('/');
  }

  return (
    <>
      {!user || !currentRoom ? (
        <h3>Loading...</h3>
      ) : (
        <div className=" flex justify-between gap-10 w-screen px-5 mt-5">
          <div className="flex flex-col items-center text-center w-4/12 mb-10">
            <div className="flex justify-between items-center h-8 w-full">
              <h4>{`${user} in a "${currentRoom.name}" room`} </h4>

              <button
                className=" w-20 rounded-xl border-2 bg-red-600 h-full"
                onClick={handleLogOut}
                type="button"
              >
                Log out
              </button>
            </div>

            <div className="border-2 w-full">
              <Formik
                initialValues={{ newMessage: '' }}
                validateOnMount={true}
                onSubmit={({ newMessage }, formikHelpers) => {
                  formikHelpers.setSubmitting(true);

                  userService
                    .newMessage(newMessage, currentRoom.id)
                    .then((res) => {
                      sendMessage(res);
                      formikHelpers.resetForm();
                    })
                    .catch((error) => {
                      if (error.message) {
                        setError(error.message);
                      }

                      if (!error.response?.data) {
                        return;
                      }

                      const { message } = error.response.data;

                      if (message) {
                        setError(message);
                      }
                    })
                    .finally(() => {
                      formikHelpers.setSubmitting(false);
                    });
                }}
              >
                {({
                  touched,
                  errors,
                  isSubmitting,
                  values,
                  setFieldValue,
                  resetForm,
                }) => (
                  <div className="flex flex-col items-center">
                    <div className="flex overflow-y-scroll items-start flex-col-reverse border-solid border-gray-300 rounded-xl h-70vh w-full px-4 py-2">
                      <div className="flex flex-col items-start w-full">
                        {currentRoom.history.map((mes) => {
                          return (
                            <div
                              key={mes.id}
                              className="bg-slate-100 p-2 mb-2 rounded-xl border-2 w-full"
                            >
                              <p className="text-start text-sm text-stone-500">
                                {mes.user}
                              </p>
                              <p
                                className="flex max-w-full p-2 rounded-xl border-2 bg-slate-200 w-full text-start"
                                style={{
                                  wordBreak: 'break-word',
                                  overflowWrap: 'break-word',
                                }}
                              >
                                {mes.message}
                                <br />
                              </p>
                              <p className="text-end text-xs text-stone-400">
                                {mes.time}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Form className="w-full">
                      <div className="flex h-8">
                        <div className="w-full h-full">
                          <Field
                            className="w-full border-1 border-gray-300 border-2 rounded-l-xl px-4 h-8"
                            validate={messageValidation}
                            name="newMessage"
                            type="text"
                            id="newMessage"
                            placeholder="Message"
                          />
                        </div>

                        <button
                          id="send-message-button"
                          className="w-20 h-full bg-green-600"
                          type="submit"
                          disabled={
                            isSubmitting ||
                            errors.newMessage ||
                            !values.newMessage
                          }
                        >
                          Send
                        </button>

                        <button
                          className="w-20 rounded-r-xl border-2 h-full bg-blue-600"
                          onClick={() => {
                            resetForm();
                            setFieldValue('newMessage', '');
                          }}
                          type="button"
                          disabled={isSubmitting || !values.newMessage}
                        >
                          Clear
                        </button>
                      </div>

                      {touched.newMessage && errors.newMessage && (
                        <p style={{ color: 'red', marginTop: '5px' }}>
                          {errors.newMessage}
                        </p>
                      )}
                    </Form>
                  </div>
                )}
              </Formik>

              {error && (
                <p style={{ color: 'red', marginTop: '5px' }}>{error}</p>
              )}
            </div>
          </div>

          <div className="w-8/12">
            <ChatBlock />
          </div>
        </div>
      )}
    </>
  );
};
