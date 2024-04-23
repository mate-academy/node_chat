import { createAsyncThunk } from "@reduxjs/toolkit";
import { send as SendMessage } from "../api/sendMessage";
import { Message } from "../types/messageTypes";
import { getAllMessages } from "../api/getAllMessage";
import { AxiosError } from "axios";
import { MESSAGES_FETCH, MESSAGES_UNREAD, MESSAGE_SEND } from "../consts/storeConsts";
import { getUnreadMessage } from "../api/getUnreadMsg";

export const getAll = createAsyncThunk(MESSAGES_FETCH.main, (chatId: number, { rejectWithValue }) => {
  return getAllMessages(chatId)
    .catch((err) => {
      let error: AxiosError = err
      return rejectWithValue(error.response?.data)
    })
})

export const getUnread
  = createAsyncThunk(
    MESSAGES_UNREAD.main,
    ({ userId, chatIds }: { userId: number, chatIds: number[] }, { rejectWithValue }) => {
      return getUnreadMessage(userId, chatIds)
        .catch((err) => {
          let error: AxiosError = err
          return rejectWithValue(error.response?.data)
        })
    })

export const send = createAsyncThunk(MESSAGE_SEND.main, (msg: Message, { rejectWithValue }) => {
  return SendMessage(msg)
    .catch(err => {
      const error: AxiosError = err;
      return rejectWithValue(error.response?.data)
    })
})