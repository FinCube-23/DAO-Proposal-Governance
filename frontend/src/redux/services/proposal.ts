import { IOffchainProposal } from "@lib/interfaces";
import { api } from "@redux/api/base";
import { PROPOSAL_ENDPOINT } from "@redux/api/endpoints";
import {
  CreateProposalPayload,
  CreateProposalResponse,
  GetOffchainProposalResponse,
} from "@redux/api/types";

export const proposalApis = api.injectEndpoints({
  endpoints: (build) => ({
    // get proposals
    getProposals: build.query<
      GetOffchainProposalResponse,
      { pageNumber: number; limit: number }
    >({
      query: ({ pageNumber, limit }) => {
        return {
          url: `${PROPOSAL_ENDPOINT.BASE}?page=${pageNumber}&limit=${limit}`,
          method: "GET",
        };
      },
      providesTags: ["proposal"],
    }),
    // get proposal
    getProposal: build.query<IOffchainProposal, number>({
      query: (id) => ({
        url: `${PROPOSAL_ENDPOINT.BASE}/${id}`,
        method: "GET",
      }),
      providesTags: ["proposal"],
    }),
    // create proposal
    createProposal: build.mutation<
      CreateProposalResponse,
      CreateProposalPayload
    >({
      query: (payload) => ({
        url: PROPOSAL_ENDPOINT.BASE,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["proposal"],
    }),
    // execute proposals
    executeProposal: build.mutation<
      Response,
      { proposalId: number; transactionHash: string }
    >({
      query: (payload) => ({
        url: `${PROPOSAL_ENDPOINT.BASE}/execute-proposal`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["proposal"],
    }),
    // cancel proposal
    cancelProposal: build.mutation<
      Response,
      { proposalId: number; transactionHash: string }
    >({
      query: (payload) => ({
        url: `${PROPOSAL_ENDPOINT.BASE}/cancel-proposal`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["proposal"],
    }),
    // filter proposals
    filterProposals: build.query<GetOffchainProposalResponse, string>({
      query: (payload) => {
        return {
          url: `${PROPOSAL_ENDPOINT.BASE}/filter/${payload}`,
          method: "GET",
        };
      },
      providesTags: ["proposal"],
    }),
  }),
});

export const {
  useLazyFilterProposalsQuery,
  useLazyGetProposalsQuery,
  useCreateProposalMutation,
  useLazyGetProposalQuery,
  useExecuteProposalMutation,
  useCancelProposalMutation,
} = proposalApis;
