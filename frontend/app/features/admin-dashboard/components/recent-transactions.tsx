import type { IProposal } from '@/core/api/interfaces';
import { readContract } from '@wagmi/core';
import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { config } from '@/core/config';
import contractABI from '@/core/contract/contract-abi.json';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';

export function RecentTransactions() {
  const [proposalsByPage, setProposalsByPage] = useState<IProposal[]>();
  const [loading, setLoading] = useState<boolean>();

  useEffect(() => {
    const getProposalsByPage = async (page: any) => {
      setLoading(true);
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
          functionName: 'getProposalsByPage',
          args: [page, 5],
        });

        const filteredProposals = response[0].filter(
          (proposal: any) =>
            proposal.proposer !== '0x0000000000000000000000000000000000000000',
        );

        setProposalsByPage(filteredProposals);
      }
      catch (e) {
        console.error(e);
      }
      finally {
        setLoading(false);
      }
    };

    getProposalsByPage(0);
  }, []);

  return (
    <div className="space-y-8">
      {loading
        ? (
            <div className="flex justify-center mt-28">
              <Loader className="animate-spin" />
            </div>
          )
        : (
            <>
              {proposalsByPage?.map((proposal, idx) => (
                <div key={idx} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/avatars/01.png" alt="Avatar" />
                    <AvatarFallback>{proposal.proposalURI[0]}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {proposal.proposalURI}
                    </p>
                    <a
                      target="_"
                      href={`${import.meta.env.VITE_ADDRESS_EXPLORER}${
                        proposal.proposer
                      }`}
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      {proposal.proposer}
                    </a>
                  </div>
                  <div className="ml-auto font-medium">
                    {proposal.canceled && !proposal.executed
                      ? (
                          <Badge variant="danger">Canceled</Badge>
                        )
                      : !proposal.canceled && proposal.executed
                          ? (
                              <Badge variant="success">Confirmed</Badge>
                            )
                          : (
                              !proposal.canceled
                              && !proposal.executed && <Badge variant="warning">Pending</Badge>
                            )}
                  </div>
                </div>
              ))}
            </>
          )}
    </div>
  );
}
