import { api } from "@redux/api/base";
import { AUDIT_ENDPOINT } from "@redux/api/endpoints";
import { GetOneTrxResponse, GetTrxResponse } from "@redux/api/types";

export const auditTrailApis = api.injectEndpoints({
  endpoints: (build) => ({
    getTransactions: build.query<
      GetTrxResponse,
      {
        page: number;
        limit: number;
        status?: string;
        source?: string;
        hash?: string;
      }
    >({
      query: ({ page, limit, status, source, hash }) => {
        let url = `${AUDIT_ENDPOINT.BASE}/transactions?page=${page}&limit=${limit}`;

        if (status && status !== "all") {
          url += `&status=${status}`;
        }

        if (source && source !== "all") {
          url += `&source=${source}`;
        }

        if (hash) {
          url += `&hash=${hash}`;
        }

        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["audit"],
    }),
    getTransaction: build.query<GetOneTrxResponse, number>({
      query: (id) => {
        return {
          url: `${AUDIT_ENDPOINT.BASE}/transactions/${id}`,
          method: "GET",
        };
      },
      providesTags: ["audit"],
    }),
  }),
});

export const { useLazyGetTransactionsQuery, useLazyGetTransactionQuery } =
  auditTrailApis;
