import { combineReducers } from "redux";

import { store } from "./store";

import authReducer from "@redux/slices/auth";

const rootReducer = combineReducers({ authReducer });

export type RootState = ReturnType<typeof store.getState>;

export default rootReducer;
