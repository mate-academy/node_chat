/* eslint-disable no-param-reassign */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store.ts';
import { User } from '../../types/user.ts';
import { createNewUser, getAllUsers } from '../../api/users.ts';

export interface userState {
  loaded: boolean;
  user: User | null;
  users: User[];
  responseUser: User | null;
}

const initialState: userState = {
  loaded: false,
  user: null,
  users: [],
  responseUser: null,
};

export const initNewUser = createAsyncThunk('newUser/FETCH', (name: User) =>
  createNewUser(name),
);

export const initUsers = createAsyncThunk('users/FETCH', () => getAllUsers());

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, actions) => {
      state.user = actions.payload;
    },
    setResponseUser: (state, action) => {
      state.responseUser = action.payload;
    },
  },

  extraReducers(builder) {
    builder.addCase(initNewUser.pending, (state) => {
      state.loaded = true;
    });

    builder.addCase(initNewUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.loaded = false;
    });

    builder.addCase(initNewUser.rejected, (state) => {
      state.loaded = false;
    });

    builder.addCase(initUsers.pending, (state) => {
      state.loaded = true;
    });

    builder.addCase(initUsers.fulfilled, (state, action) => {
      state.users = action.payload;
      state.loaded = false;
    });

    builder.addCase(initUsers.rejected, (state) => {
      state.loaded = false;
    });
  },
});

export const { setUser, setResponseUser } = userSlice.actions;

export const selectUser = (state: RootState) => state.users;

export default userSlice.reducer;
