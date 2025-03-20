import { api } from "@redux/api/base";
import { AUDIT_ENDPOINT } from "@redux/api/endpoints";
import { GetTrxResponse } from "@redux/api/types";

export const auditTrailApis = api.injectEndpoints({
  endpoints: (build) => ({
    getTransactions: build.query<
      GetTrxResponse,
      { page: number; limit: number; status?: string }
    >({
      query: () => {
        return {
          url: `${AUDIT_ENDPOINT.BASE}/transactions`,
          method: "GET",
        };
      },
      providesTags: ["audit"],
    }),
  }),
});

export const { useLazyGetTransactionsQuery } = auditTrailApis;
