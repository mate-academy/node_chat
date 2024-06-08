import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  user: null,
  loading: false,
  error: {
    status: false,
    message: ''
  },
};

export const postUser = createAsyncThunk(
  'user/postUser',
  async (userName, { rejectWithValue }) => {
    try {
      const res = await axios.post('http://localhost:3001/user/register', { userName });

      if (res.status !== 200) {
        throw new Error('something went wrong');
      }

      return res.data;

    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const getUser = createAsyncThunk(
  'user/getUser',
  async () => {
    const userFromStorage = JSON.parse(localStorage.getItem('user'));

    if (!userFromStorage) {
      return null;
    }

    try {
    const res = await axios.get('http://localhost:3001/user/' + userFromStorage.id);

    if (res.status !== 200) {
      return null;
    }

    return res.data;
    } catch (e) {
      return null;
    }
  }
);

const usersSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setErrorUser(state, action) {
      state.error = action.payload;
      return state;
    },
    removeUserFromStorage(state) {
      state.user = null;

      localStorage.removeItem('user');
      return state;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(postUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(postUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      .addCase(postUser.rejected, (state) => {
        const error = { status: true, message: 'cannot post user'};

        state.loading = false;
        state.error = error;
      })
      .addCase(getUser.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
      })
  }
});

export const { setErrorUser, setUserNull, removeUserFromStorage } = usersSlice.actions;
export default usersSlice.reducer;
