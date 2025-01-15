import { FetchMeResponse } from "@redux/api/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TokenPayload = {
    access: string;
};

type MFSInfo = {
    id: number;
    name: string;
    org_email: string;
    wallet_address: string;
    native_currency: string;
    certificate: string;
    user_id: number;
    is_approved: boolean;
};

type ProfilePayload = FetchMeResponse;

interface AuthStoreState {
    access: string | null;
    profile: ProfilePayload | null;
    mfsInfo: MFSInfo | null;
}

const initialState: AuthStoreState = {
    access: null,
    profile: null,
    mfsInfo: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
      setTokens: (state, action: PayloadAction<TokenPayload | null>) => {
          state.access = action.payload?.access || null;
      },
      setProfile: (state, action: PayloadAction<ProfilePayload | null>) => {
          state.profile = action.payload;
      },
      clearAuthState: (state) => {
          Object.assign(state, initialState);
      },
  },
});

export const { setTokens, setProfile, clearAuthState } = authSlice.actions;

export default authSlice.reducer;
