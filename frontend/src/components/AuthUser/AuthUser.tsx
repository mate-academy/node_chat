import React, { useRef } from 'react';
import './AuthUser.scss';
import {
  useAppDispatch,
  useAppSelector,
} from '../../redux/custom.hooks.ts';
import {
  initNewUser,
  selectUser,
  setResponseUser,
  setUser,
} from '../../redux/slices/userSlice.ts';
import { Loader } from '../Loader/Loader.jsx';

export const AuthUser: React.FC = () => {
  const { user, loaded } = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (user) {
      dispatch(initNewUser(user))
        .then((user) => {
          dispatch(setResponseUser(user.payload));

          if (user.payload) {
            localStorage.setItem('name', JSON.stringify(user.payload.name));
            localStorage.setItem('id', JSON.stringify(user.payload.id));
          }

          if (formRef.current) {
            formRef.current.reset();
          }
        })
        .catch(() => {
          throw new Error('Error post Users');
        });
    }
  };

  return (
    <div className="AuthUser">
      <center className="AuthUser__center">
        {loaded ? (
          <Loader />
        ) : (
          <form
            ref={formRef}
            onSubmit={(event) => handleSubmit(event)}
            method="post"
            className="AuthUser__form"
          >
            <label className="AuthUser__form__label" htmlFor="name">
              enter your name
            </label>

            <input
              className="AuthUser__form__input"
              id="name"
              type="text"
              minLength={4}
              maxLength={16}
              onChange={(e) => {
                dispatch(setUser(e.target.value));
              }}
            />
          </form>
        )}
      </center>
    </div>
  );
};
