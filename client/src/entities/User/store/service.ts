import { PayloadAction } from "@reduxjs/toolkit";
import { UserState } from "../types/userTypes";

interface RejectedPayload {
  message: string;
}

export const handleAuthCase = (state: UserState, action: PayloadAction<any>) => {
  if (!action?.payload) {
    state.loading = true;
    return;
  }

  state.loading = false;

  if (!action.payload.errors) {
    state.user = action.payload.user;
    state.accessToken = action.payload.accessToken;
  } else {
    const payload = action.payload as RejectedPayload;
    state.error = payload.message;
  }
};
