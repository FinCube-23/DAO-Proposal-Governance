import { FetchMeResponse, MFSBusiness } from "@redux/api/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TokenPayload = {
    access: string;
};

type ProfilePayload = FetchMeResponse;

interface AuthStoreState {
    access: string | null;
    profile: ProfilePayload | null;
}

const initialState: AuthStoreState = {
    access: null,
    profile: null,
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
        setMfsBusiness: (state, action: PayloadAction<MFSBusiness | null>) => {
            if (state.profile) state.profile.mfsBusiness = action.payload;
        },
        clearAuthState: (state) => {
            Object.assign(state, initialState);
        },
    },
});

export const { setTokens, setProfile, setMfsBusiness, clearAuthState } = authSlice.actions;

export default authSlice.reducer;
