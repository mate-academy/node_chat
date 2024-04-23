import { AxiosError } from "axios";
import { getUserChats } from "../../api/getUserChats";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { FETCH_USER_CHATS } from "../../consts/storeConsts";

export const getChats
  = createAsyncThunk(FETCH_USER_CHATS.main, (userId: number, { rejectWithValue }) => {
    return getUserChats(userId)
      .catch(err => {
        let error: AxiosError = err
        if (!error.response) {
          throw err
        }

        return rejectWithValue(error.response.data)
      })
  });


