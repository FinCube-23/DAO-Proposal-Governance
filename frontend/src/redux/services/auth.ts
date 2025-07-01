import { api } from "@/redux/api/base";
import { AUTH_ENDPOINTS } from "@redux/api/endpoints";
import {
    FetchMeResponse,
    LoginPayload,
    LoginResponse,
    RegisterPayload,
    RegisterResponse,
} from "@redux/api/types";

export const authApis = api.injectEndpoints({
    endpoints: (build) => ({
        login: build.mutation<LoginResponse, LoginPayload>({
            query: (payload) => ({
                url: AUTH_ENDPOINTS.BASE + "/login",
                method: "POST",
                body: payload,
            }),
        }),
        register: build.mutation<RegisterResponse, RegisterPayload>({
            query: (payload) => ({
                url: AUTH_ENDPOINTS.BASE + "/register",
                method: "POST",
                body: payload,
            }),
        }),
        fetchMe: build.query<FetchMeResponse, void>({
            query: () => {
                return {
                    url: AUTH_ENDPOINTS.BASE + "/profile",
                    method: "GET",
                };
            },
            providesTags: ["auth"],
        }),
    }),
});

export const { useLazyFetchMeQuery, useLoginMutation, useRegisterMutation } =
    authApis;
