import type { IProposal } from '@/core/api/interfaces';
import { readContract } from '@wagmi/core';
import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { config } from '@/core/config';
import contractABI from '@/core/contract/contract-abi.json';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';

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
    <div className="space-y-6 sm:space-y-8">
      {loading
        ? (
            <div className="flex justify-center mt-20 sm:mt-28">
              <Loader className="animate-spin" />
            </div>
          )
        : (
            <>
              {proposalsByPage?.map((proposal, idx) => (
                <div key={idx} className="flex items-start sm:items-center flex-col sm:flex-row gap-3 sm:gap-0">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
                    <AvatarImage src="/avatars/01.png" alt="Avatar" />
                    <AvatarFallback>{proposal.proposalURI[0]}</AvatarFallback>
                  </Avatar>
                  <div className="sm:ml-4 space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none break-words">
                      {proposal.proposalURI}
                    </p>
                    <a
                      target="_"
                      href={`${import.meta.env.VITE_ADDRESS_EXPLORER}${
                        proposal.proposer
                      }`}
                      className="text-xs sm:text-sm text-muted-foreground hover:underline break-all block"
                    >
                      {proposal.proposer}
                    </a>
                  </div>
                  <div className="sm:ml-auto font-medium flex-shrink-0">
                    {proposal.canceled && !proposal.executed
                      ? (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 border-red-500/20 text-red-400 border whitespace-nowrap">
                            <span>Canceled</span>
                          </div>
                        )
                      : !proposal.canceled && proposal.executed
                          ? (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 border-green-500/20 text-green-400 border whitespace-nowrap">
                                <span>Confirmed</span>
                              </div>
                            )
                          : (
                              !proposal.canceled
                              && !proposal.executed && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 border-yellow-500/20 text-yellow-400 border whitespace-nowrap">
                                  <span>Pending</span>
                                </div>
                              )
                            )}
                  </div>
                </div>
              ))}
            </>
          )}
    </div>
  );
}
