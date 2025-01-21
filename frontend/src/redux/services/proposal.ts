import { api } from "@redux/api/base";
import { PROPOSAL_ENDPOINT } from "@redux/api/endpoints";
import {
  CreateProposalPayload,
  CreateProposalResponse,
  GetProposalResponse,
} from "@redux/api/types";

export const proposalApis = api.injectEndpoints({
  endpoints: (build) => ({
    // get proposal
    getProposals: build.query<GetProposalResponse, void>({
      query: () => {
        return {
          url: PROPOSAL_ENDPOINT.BASE,
          method: "GET",
        };
      },
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
  }),
});

export const { useLazyGetProposalsQuery, useCreateProposalMutation } =
  proposalApis;
