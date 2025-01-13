import { api } from "@/redux/api/base";
import { AUTH_ENDPOINTS } from "@redux/api/endpoints";
import { AuthMeResponse } from "@redux/api/types";

export const authApis = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<void, { email: string; password: string }>({
      query: (payload) => ({
        url: AUTH_ENDPOINTS.BASE + "/login",
        method: "POST",
        body: payload,
      }),
    }),
    fetchMe: build.query<AuthMeResponse, void>({
      query: () => {
        return {
          url: AUTH_ENDPOINTS.BASE + "/me",
          method: "GET",
        };
      },
      providesTags: ["auth"],
    }),
  }),
});

export const { useLazyFetchMeQuery, useLoginMutation } = authApis;