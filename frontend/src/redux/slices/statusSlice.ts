// @redux/slices/statusSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StatusState {
  pending: boolean;
}

const initialState: StatusState = {
  pending: false,
};

const statusSlice = createSlice({
  name: "status",
  initialState,
  reducers: {
    setPending: (state, action: PayloadAction<boolean>) => {
      state.pending = action.payload;
    },
  },
});

export const { setPending } = statusSlice.actions;

export default statusSlice.reducer;
