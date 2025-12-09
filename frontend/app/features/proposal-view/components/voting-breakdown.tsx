import type { IProposal } from '@/core/api/interfaces';
import { useMutation } from '@tanstack/react-query';
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from '@wagmi/core';
import { CheckCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { config } from '@/core/config';
import contractABI from '@/core/contract/contract-abi.json';
import { env } from '@/core/env';
import { proposalApis } from '@/core/services/proposal';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { shortenAddress } from '@/shared/utils';
import VotingProgressBar from './voting-progress-bar';

export default function VotingBreakdown({ proposalId }: any) {
  const { address, chainId } = useAccount();
  const voteRef = useRef({ proposalId: '', support: false });
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [proposal, setProposal] = useState<IProposal>();
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [voteStatus, setVoteStatus] = useState(true);
  const [voteTrxHash, setVoteTrxHash] = useState('');
  const [executeTrxHash, setExecuteTrxHash] = useState('');
  const [cancelTrxHash, setCancelTrxHash] = useState('');
  const navigate = useNavigate();
  const executeProposal = useMutation({
    mutationFn: proposalApis.executeProposal,
    onSuccess: () => {
      toast.success('Proposal executed successfully');
    },
  });
  const cancelProposal = useMutation({
    mutationFn: proposalApis.cancelProposal,
    onSuccess: () => {
      toast.success('Proposal cancelled successfully');
    },
  });

  const castVote = async (value: boolean) => {
    setLoadingStatus(true);
    voteRef.current = { proposalId, support: value };
    try {
      const { request } = await simulateContract(config, {
        abi: contractABI,
        address: env.VITE_SMART_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'castVote',
        args: [Number(voteRef.current.proposalId), voteRef.current.support],
      });
      const hash = await writeContract(config, request);

      setVoteTrxHash(hash);
      setVoteDialogOpen(true);

      await waitForTransactionReceipt(config, { hash });

      toast.success(
        `You voted ${
          value ? 'SUPPORT' : 'AGAINST'
        } for proposal ID: ${proposalId}`,
      );
    }
    catch (e: any) {
      console.error('Vote casting error:', e);
      let errorMessage = e?.message || e?.reason || e?.toString() || 'An error occurred while casting vote';

      if (errorMessage.includes('reverted with the following reason:')) {
        const match = errorMessage.match(
          /reverted with the following reason:\s*(.*)/,
        );
        if (match) {
          errorMessage = match[1];
        }
      }

      console.warn('Showing toast error:', errorMessage);
      toast.error(errorMessage);
    }
    setLoadingStatus(false);
  };

  const execute = async () => {
    setLoadingStatus(true);
    try {
      const { request } = await simulateContract(config, {
        abi: contractABI,
        address: env.VITE_SMART_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'executeProposal',
        args: [proposalId],
      });
      const hash = await writeContract(config, request);

      setExecuteTrxHash(hash);
      setExecuteDialogOpen(true);

      const backendData = {
        proposalId,
        onChainData: {
          transactionHash: hash,
          signedBy: `0x${address}`,
          signedWith: 'metamask',
          chainId: Number(chainId),
          context: { __typename: 'ProposalExecuted' },
        },
      };

      executeProposal.mutate(backendData);
      await waitForTransactionReceipt(config, { hash });
    }
    catch (e: any) {
      let errorMessage = e?.message || e?.reason || e?.toString() || 'An error occurred while executing proposal';

      if (errorMessage.includes('reverted with the following reason:')) {
        const match = errorMessage.match(
          /reverted with the following reason:\s*(.*)/,
        );
        if (match) {
          errorMessage = match[1];
        }
      }
      toast.error(errorMessage);
    }
    setLoadingStatus(false);
  };

  const cancel = async () => {
    setLoadingStatus(true);
    try {
      const { request } = await simulateContract(config, {
        abi: contractABI,
        address: env.VITE_SMART_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'cancelProposal',
        args: [proposalId],
      });
      const hash = await writeContract(config, request);

      setCancelTrxHash(hash);
      setCancelDialogOpen(true);

      const backendData = {
        proposalId,
        onChainData: {
          transactionHash: hash,
          signedBy: `0x${address}`,
          signedWith: 'metamask',
          chainId: Number(chainId),
          context: { __typename: 'ProposalCanceled' },
        },
      };

      cancelProposal.mutate(backendData);

      await waitForTransactionReceipt(config, { hash });
    }
    catch (e: any) {
      console.error('Proposal cancellation error:', e);
      let errorMessage = e?.message || e?.reason || e?.toString() || 'An error occurred while cancelling proposal';

      if (errorMessage.includes('reverted with the following reason:')) {
        const match = errorMessage.match(
          /reverted with the following reason:\s*(.*)/,
        );
        if (match) {
          errorMessage = match[1];
        }
      }
      console.warn('Showing toast error:', errorMessage);
      toast.error(errorMessage);
    }
    setLoadingStatus(false);
  };

  useEffect(() => {
    const getProposalsById = async () => {
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: env.VITE_SMART_CONTRACT_ADDRESS as `0x${string}`,
          functionName: 'getProposalsById',
          args: [proposalId],
        });

        setProposal(response);
      }
      catch (e) {
        console.error('Failed to fetch proposal information:', e);
      }
    };

    getProposalsById();
  }, [proposalId]);

  useEffect(() => {
    const currentTime = Date.now() / 1000;
    if (currentTime > Number(proposal?.voteDuration)) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setVoteStatus(false);
    }
  }, [proposal]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
        <div className="text-primary font-bold text-sm sm:text-base">Approved By</div>
        {proposal && (
          <div className="text-sm sm:text-base">
            <span className="text-primary font-bold">
              {proposal.yesvotes.toString()}
              {' '}
            </span>
            of
            {' '}
            {(proposal.yesvotes + proposal.novotes).toString()}
            {' '}
            Members
          </div>
        )}
      </div>
      {proposal && (
        <VotingProgressBar
          total={Number(proposal.yesvotes + proposal.novotes)}
          yes={Number(proposal.yesvotes)}
          no={Number(proposal.novotes)}
        />
      )}
      <div className="flex flex-wrap justify-start sm:justify-end gap-2">
        {voteStatus && !proposal?.canceled && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-400 font-bold mt-2 text-xs sm:text-sm">Vote</Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-center text-orange-400 text-base sm:text-lg">
                  Cast your vote?
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                  <Button
                    isLoading={loadingStatus}
                    className="bg-green-400 font-bold text-sm sm:text-base"
                    onClick={() => castVote(true)}
                  >
                    SUPPORT
                  </Button>
                  <Button
                    isLoading={loadingStatus}
                    className="bg-red-400 font-bold text-sm sm:text-base"
                    onClick={() => castVote(false)}
                  >
                    AGAINST
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {!voteStatus
          && Number(proposal?.yesvotes) >= 1
          && !proposal?.executed
          && !proposal?.canceled && (
          <Button
            isLoading={loadingStatus}
            onClick={execute}
            className="bg-blue-400 hover:bg-blue-500 font-bold mt-2 text-white text-xs sm:text-sm"
          >
            Execute
          </Button>
        )}
        {address === proposal?.proposer
          && !proposal?.canceled
          && !proposal?.executed && (
          <Button
            isLoading={loadingStatus}
            onClick={cancel}
            className="bg-red-400 hover:bg-red-500 font-bold mt-2 text-white text-xs sm:text-sm"
          >
            Cancel
          </Button>
        )}
      </div>
      <Dialog
        open={voteDialogOpen}
        onOpenChange={(open) => {
          setVoteDialogOpen(open);
          if (!open)
            navigate('/organization/dao/proposals');
        }}
      >
        <DialogContent className="border-gray-700 bg-gray-900 w-[95vw] max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-green-400 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              Vote Cast Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300 text-sm sm:text-base">
              You have successfully cast your vote
              {' '}
              <span className="font-semibold text-white">
                {voteRef.current.support ? 'SUPPORT' : 'AGAINST'}
              </span>
              {' '}
              for proposal ID:
              {' '}
              <span className="font-semibold text-blue-400">
                {proposalId}
              </span>
              . Your vote is now being processed on the blockchain.
            </p>
            <div className="p-3 sm:p-4 bg-gray-800 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-400 mb-2">Transaction Hash:</p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <code className="text-blue-400 text-xs sm:text-sm bg-gray-900 p-2 rounded flex-1 break-all">
                  {shortenAddress(voteTrxHash)}
                </code>
                <a
                  href={`${env.VITE_TRX_EXPLORER}/${voteTrxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500/10 w-full sm:w-auto text-xs sm:text-sm"
                  >
                    View on Explorer
                  </Button>
                </a>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => navigate('/organization/dao/proposals')}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              View All Proposals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={executeDialogOpen}
        onOpenChange={(open) => {
          setExecuteDialogOpen(open);
          if (!open)
            navigate('/organization/dao/proposals');
        }}
      >
        <DialogContent className="border-gray-700 bg-gray-900 w-[95vw] max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-green-400 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              Proposal Execution Started
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300 text-sm sm:text-base">
              Proposal execution has been initiated and is now being processed on the blockchain. This may take a few moments to complete.
            </p>
            <div className="p-3 sm:p-4 bg-gray-800 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-400 mb-2">Transaction Hash:</p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <code className="text-blue-400 text-xs sm:text-sm bg-gray-900 p-2 rounded flex-1 break-all">
                  {shortenAddress(executeTrxHash)}
                </code>
                <a
                  href={`${env.VITE_TRX_EXPLORER}/${executeTrxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500/10 w-full sm:w-auto text-xs sm:text-sm"
                  >
                    View on Explorer
                  </Button>
                </a>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => navigate('/organization/dao/proposals')}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              View All Proposals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          setCancelDialogOpen(open);
          if (!open)
            navigate('/organization/dao/proposals');
        }}
      >
        <DialogContent className="border-gray-700 bg-gray-900 w-[95vw] max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-green-400 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              Proposal Cancellation Started
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300 text-sm sm:text-base">
              Proposal cancellation has been initiated and is now being processed on the blockchain. This may take a few moments to complete.
            </p>
            <div className="p-3 sm:p-4 bg-gray-800 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-400 mb-2">Transaction Hash:</p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <code className="text-blue-400 text-xs sm:text-sm bg-gray-900 p-2 rounded flex-1 break-all">
                  {shortenAddress(cancelTrxHash)}
                </code>
                <a
                  href={`${env.VITE_TRX_EXPLORER}/${cancelTrxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500/10 w-full sm:w-auto text-xs sm:text-sm"
                  >
                    View on Explorer
                  </Button>
                </a>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => navigate('/organization/dao/proposals')}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              View All Proposals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
