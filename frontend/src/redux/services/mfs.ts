import { api } from "@/redux/api/base";
import { MFS_ENDPOINT } from "@redux/api/endpoints";
import { CreateMFSPayload, CreateMFSResponse } from "@redux/api/types";

export const mfsApis = api.injectEndpoints({
  endpoints: (build) => ({
    createMFS: build.mutation<
      CreateMFSResponse,
      CreateMFSPayload
    >({
      query(form) {
        return {
          url: MFS_ENDPOINT.BASE,
          method: "POST",
          body: form,
        };
      },
      invalidatesTags: ["mfs"],
    }),
  }),
});

export const { useCreateMFSMutation } = mfsApis;