import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TokenPayload = {
  access: string;
};

type UserPayload = {
  sub?: string;
  type?: string;
  id?: number;
};

interface AuthState {
  access?: string;
  sub?: string;
  type?: string;
  id?: number;
}

interface IInitialState {
  auth: AuthState | null;
}

const initialState: IInitialState = {
  auth: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthData: (
      state: IInitialState,
      action: PayloadAction<TokenPayload | null>,
    ) => {
      if (action.payload?.access) {
        state.auth = { ...action.payload };
      } else {
        state.auth = {};
      }
    },
    setUserProfile: (
      state: IInitialState,
      action: PayloadAction<UserPayload>,
    ) => {
      state.auth = { ...state.auth, ...action.payload };
    },
    clearAuth: (state: IInitialState) => {
      state.auth = {};
    },
  },
});

export const { setAuthData, setUserProfile, clearAuth } = authSlice.actions;

export default authSlice.reducer;
