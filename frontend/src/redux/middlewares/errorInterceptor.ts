/*eslint-disable*/
import {
    isRejectedWithValue,
    Middleware,
    MiddlewareAPI,
} from "@reduxjs/toolkit";

export const rtkQueryErrorLogger: Middleware =
    (api: MiddlewareAPI) => (next) => (action: any) => {
        // RTK Query uses `createAsyncThunk` from redux-toolkit under the hood, so we're able to utilize these matchers!
        if (isRejectedWithValue(action)) {
            console.log("BACKEND ERROR", action?.payload);
            if (
                action?.payload?.data?.error?.statusCode === 401 &&
                action?.payload?.data?.error?.message === "jwt expired"
            ) {
                console.log("Your session has expired. Please login again.");
            }
        }

        return next(action);
    };
