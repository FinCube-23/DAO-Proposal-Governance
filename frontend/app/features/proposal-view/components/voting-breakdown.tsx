import type { IProposal } from '@/core/api/interfaces';
import { useMutation } from '@tanstack/react-query';
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from '@wagmi/core';
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
import VotingProgressBar from './voting-progress-bar';

export default function VotingBreakdown({ proposalId }: any) {
  const { address } = useAccount();
  const voteRef = useRef({ proposalId: '', support: false });
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [proposal, setProposal] = useState<IProposal>();
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [voteStatus, setVoteStatus] = useState(true);
  const navigate = useNavigate();
  // const [executeProposal] = useExecuteProposalMutation();
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

      setVoteDialogOpen(true);

      await waitForTransactionReceipt(config, { hash });

      toast.success(
        `You voted ${
          value ? 'SUPPORT' : 'AGAINST'
        } for proposal ID: ${proposalId}`,
      );
    }
    catch (e: any) {
      let errorMessage = e.message;

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

      setExecuteDialogOpen(true);

      executeProposal.mutate({ proposalId, transactionHash: hash });
      await waitForTransactionReceipt(config, { hash });
    }
    catch (e: any) {
      let errorMessage = e.message;

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

      setCancelDialogOpen(true);

      cancelProposal.mutate({ proposalId, transactionHash: hash });

      await waitForTransactionReceipt(config, { hash });
    }
    catch (e: any) {
      let errorMessage = e.message;

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
      <div className="flex justify-between">
        <div className="text-primary font-bold">Approved By</div>
        {proposal && (
          <div>
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
      <div className="flex justify-end">
        {voteStatus && !proposal?.canceled && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-400 font-bold mt-2">Vote</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-center text-orange-400">
                  Cast your vote?
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <div className="flex justify-center">
                  <Button
                    isLoading={loadingStatus}
                    className="bg-green-400 font-bold mx-4"
                    onClick={() => castVote(true)}
                  >
                    SUPPORT
                  </Button>
                  <Button
                    isLoading={loadingStatus}
                    className="bg-red-400 font-bold mx-4"
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
            className="bg-blue-400 hover:bg-blue-500 font-bold mt-2 mx-2 text-white"
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
            className="bg-red-400 hover:bg-red-500 font-bold mt-2 mx-2 text-white"
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
            navigate('/organization/dao/fincube');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <h2 className="text-lg font-bold text-green-400">Vote casted</h2>
          </DialogHeader>
          <p className="text-center text-yellow-400">
            You have successfully casted your vote and is now under process!
          </p>
          <DialogFooter>
            <Button
              className="bg-blue-600 font-bold hover:bg-blue-700 text-white"
              onClick={() => navigate('/organization/dao/fincube')}
            >
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={executeDialogOpen}
        onOpenChange={(open) => {
          setExecuteDialogOpen(open);
          if (!open)
            navigate('/organization/dao/fincube');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <h2 className="text-lg font-bold text-green-400">Vote casted</h2>
          </DialogHeader>
          <p className="text-center text-yellow-400">
            Proposal execution is now under process.
          </p>
          <DialogFooter>
            <Button
              className="bg-blue-600 font-bold hover:bg-blue-700 text-white"
              onClick={() => navigate('/organization/dao/fincube')}
            >
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          setCancelDialogOpen(open);
          if (!open)
            navigate('/organization/dao/fincube');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <h2 className="text-lg font-bold text-green-400">Vote casted</h2>
          </DialogHeader>
          <p className="text-center text-yellow-400">
            Proposal cancellation is now under process.
          </p>
          <DialogFooter>
            <Button
              className="bg-blue-600 font-bold hover:bg-blue-700 text-white"
              onClick={() => navigate('/organization/dao/fincube')}
            >
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
