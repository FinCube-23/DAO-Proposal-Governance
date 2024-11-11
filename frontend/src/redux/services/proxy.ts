import { api } from "@redux/api/base";
import { PROXY_ENDPOINT } from "@redux/api/endpoints";
import {
  ExecuteProposalResponse,
  GetBalanceResponse,
  GetOngoingProposalsResponse,
  GetProposalCountResponse,
  GetProposalThresholdResponse,
  RegisterMemberPayload,
  RegisterMemberResponse,
} from "@redux/api/types";

export const proxyApis = api.injectEndpoints({
  endpoints: (build) => ({
    // get balance
    getBalance: build.query<GetBalanceResponse, void>({
      query: () => {
        return {
          url: `${PROXY_ENDPOINT.BASE}/balance`,
          method: "GET",
        };
      },
      providesTags: ["proxy"],
    }),
    // get proposal threshold
    getProposalThreshold: build.query<GetProposalThresholdResponse, void>({
      query: () => {
        return {
          url: `${PROXY_ENDPOINT.BASE}/proposal-threshold`,
          method: "GET",
        };
      },
      providesTags: ["proxy"],
    }),
    // get proposal count
    getProposalCount: build.query<GetProposalCountResponse, void>({
      query: () => {
        return {
          url: `${PROXY_ENDPOINT.BASE}/proposal-count`,
          method: "GET",
        };
      },
      providesTags: ["proxy"],
    }),
    // get ongoing proposals
    getOngoingProposals: build.query<GetOngoingProposalsResponse, void>({
      query: () => {
        return {
          url: `${PROXY_ENDPOINT.BASE}/ongoing-proposals`,
          method: "GET",
        };
      },
      providesTags: ["proxy"],
    }),
    // register new member
    registerMember: build.mutation<
      RegisterMemberResponse,
      RegisterMemberPayload
    >({
      query: (payload) => ({
        url: `${PROXY_ENDPOINT.BASE}/register-member`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["proxy"],
    }),
    // execute proposal
    executeProposal: build.mutation<ExecuteProposalResponse, void>({
      query: () => ({
        url: `${PROXY_ENDPOINT.BASE}/execute-proposal`,
        method: "POST",
      }),
      invalidatesTags: ["proxy"],
    }),
  }),
});

export const {
  useLazyGetBalanceQuery,
  useLazyGetProposalThresholdQuery,
  useLazyGetProposalCountQuery,
  useLazyGetOngoingProposalsQuery,
  useRegisterMemberMutation,
  useExecuteProposalMutation,
} = proxyApis;
