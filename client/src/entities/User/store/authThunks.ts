import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from 'axios';

import { loginUser } from '../../../features/LoginUser';
import { LoginRequestType } from '../../../features/LoginUser';
import { registerUser } from "../api/registrationApi";
import { RegistrationRequestType } from "../types/registrarionTypes";

export const register
  = createAsyncThunk('user/register', (data: RegistrationRequestType, { rejectWithValue }) => {
    return registerUser(data)
      .then(user => {
        localStorage.setItem('user', JSON.stringify(user))
        return user;
      })
      .catch(err => {
        let error: AxiosError = err;

        if (!error.response) {
          throw err;
        }

        return rejectWithValue(error.response.data)
      })
  })

export const login
  = createAsyncThunk('user/login', (data: LoginRequestType, { rejectWithValue }) => {
    return loginUser(data)
      .then(user => {
        localStorage.setItem('user', JSON.stringify(user))
        return user;
      })
      .catch(err => {
        let error: AxiosError = err;

        if (!error.response) {
          throw err;
        }

        return rejectWithValue(error.response.data)
      })
  })