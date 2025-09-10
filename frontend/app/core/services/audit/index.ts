import type { GetOneTrxResponse, GetTrxResponse } from '@/core/api/types';
import { api } from '@/core/api/client';
import { AUDIT_ENDPOINT } from '@/core/api/endpoints';

export const auditTrailApis = {
  getTransactions: (params: {
    page: number;
    limit: number;
    status?: string;
    source?: string;
    hash?: string;
  }) =>
    api.get<GetTrxResponse>(`${AUDIT_ENDPOINT.BASE}/transactions`, {
      queryParams: params,
    }),

  getTransaction: (id: string) =>
    api.get<GetOneTrxResponse>(`${AUDIT_ENDPOINT.BASE}/transactions/${id}`),
};
