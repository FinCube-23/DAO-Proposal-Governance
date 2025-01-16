import { combineReducers } from "redux";
import statusReducer from "@redux/slices/statusSlice";

import { store } from "./store";

import authReducer from "@redux/slices/auth";

const rootReducer = combineReducers({ authReducer, status: statusReducer });

export type RootState = ReturnType<typeof store.getState>;

export default rootReducer;
