import { api } from "@/redux/api/base";
import { MFS_ENDPOINT } from "@redux/api/endpoints";
import {
  CreateMFSPayload,
  CreateMFSResponse,
  GetAllMFSBusinessResponse,
  GetMFSBusinessResponse,
  UpdateMFSPayload,
  UpdateMFSResponse,
} from "@redux/api/types";

export const mfsApis = api.injectEndpoints({
  endpoints: (build) => ({
    createMFS: build.mutation<CreateMFSResponse, CreateMFSPayload>({
      query(form) {
        return {
          url: MFS_ENDPOINT.BASE,
          method: "POST",
          body: form,
        };
      },
      invalidatesTags: ["mfs"],
    }),
    updateMFS: build.mutation<UpdateMFSResponse, UpdateMFSPayload>({
      query({ id, ...form }) {
        return {
          url: MFS_ENDPOINT.BASE + `/${id}`,
          method: "PATCH",
          body: form,
        };
      },
      invalidatesTags: ["mfs"],
    }),
    getMFS: build.query<GetMFSBusinessResponse, number>({
      query: (id) => {
        return {
          url: MFS_ENDPOINT.BASE + `/${id}`,
          method: "GET",
        };
      },
      providesTags: ["mfs"],
    }),
    getAllMFS: build.query<GetAllMFSBusinessResponse, void>({
      query: () => {
        return {
          url: MFS_ENDPOINT.BASE,
          method: "GET",
        };
      },
      providesTags: ["mfs"],
    }),
  }),
});

export const {
  useCreateMFSMutation,
  useUpdateMFSMutation,
  useLazyGetAllMFSQuery,
} = mfsApis;
