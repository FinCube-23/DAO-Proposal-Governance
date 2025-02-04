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
    // create proposal
    getProposal: build.query<IOffchainProposal, number>({
      query: (id) => ({
        url: `${PROPOSAL_ENDPOINT.BASE}/${id}`,
        method: "GET",
      }),
      providesTags: ["proposal"],
    }),
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
  }),
});

export const {
  useLazyGetProposalsQuery,
  useCreateProposalMutation,
  useLazyGetProposalQuery,
} = proposalApis;
