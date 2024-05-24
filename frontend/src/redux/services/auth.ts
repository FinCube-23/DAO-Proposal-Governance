import { api } from "@/redux/api/base";
import { AUTH_ENDPOINTS } from "@redux/api/endpoints";
import { AuthMeResponse } from "@redux/api/types";

export const authApis = api.injectEndpoints({
  endpoints: (build) => ({
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

export const { useLazyFetchMeQuery } = authApis;