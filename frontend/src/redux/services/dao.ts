import { api } from "@redux/api/base";
import { DAO_ENDPOINT } from "@redux/api/endpoints";
import {
  CreateDAOPayload,
  CreateDAOResponse,
  GetDAOResponse,
} from "@redux/api/types";

export const daoApis = api.injectEndpoints({
  endpoints: (build) => ({
    // get DAO
    getDAO: build.query<GetDAOResponse, number>({
      query: (id) => {
        return {
          url: `${DAO_ENDPOINT.BASE}/${id}`,
          method: "GET",
        };
      },
      providesTags: ["dao"],
    }),
    // create DAO
    createDAO: build.mutation<CreateDAOResponse, CreateDAOPayload>({
      query: (payload) => ({
        url: DAO_ENDPOINT.BASE,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["dao"],
    }),
  }),
});

export const { useLazyGetDAOQuery, useCreateDAOMutation } = daoApis;
