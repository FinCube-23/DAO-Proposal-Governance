import type { ChangeEvent, FormEvent } from 'react';
import type { ProposalCreatePayload } from '@/core/services/proposal/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { simulateContract, writeContract } from '@wagmi/core';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAccount, useChainId } from 'wagmi';
import { config } from '@/core/config';
import contractABI from '@/core/contract/contract-abi.json';
import { env } from '@/core/env';
import { orgApis } from '@/core/services/org';
import { proposalApis } from '@/core/services/proposal';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { shortenAddress } from '@/shared/utils';

export default function MemberProposal() {
  const [data, setData] = useState({
    _newMember: '',
    description: '',
    organizationId: '',
  });
  const { address } = useAccount();
  const chainId = useChainId();
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trxHash, setTrxHash] = useState('');
  const navigate = useNavigate();

  // Fetch organizations
  const { data: organizationsData, isLoading: organizationsLoading, error: _organizationsError } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      try {
        const response = await orgApis.getAllOrgs({ status: 'approved' });
        return response;
      }
      catch (error) {
        console.error('Error fetching organizations:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add error boundary-like handling
  if (_organizationsError) {
    console.error('Organizations query error:', _organizationsError);
  }

  const createProposal = useMutation({
    mutationFn: proposalApis.createProposal,
  });

  const handleInput = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleOrganizationSelect = (value: string) => {
    setData(prevData => ({
      ...prevData,
      organizationId: value,
    }));
  };

  const approveMember = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingStatus(true);

    if (!data.organizationId) {
      toast.error('Please select an organization');
      setLoadingStatus(false);
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet first');
      setLoadingStatus(false);
      return;
    }

    try {
      const { request } = await simulateContract(config, {
        abi: contractABI,
        address: env.VITE_SMART_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'newMemberApprovalProposal',
        args: [data._newMember, data.description],
      });

      const hash = await writeContract(config, request);

      // Create context object and stringify it
      const contextData = {
        metadata: data.description,
        organization_id: Number.parseInt(data.organizationId),
        proposal_type: 'membership',
      };

      const backendData: ProposalCreatePayload = {
        proposal_type: 'membership',
        onChainData: {
          transactionHash: hash,
          signedBy: address,
          signedWith: 'metamask',
          chainId: chainId.toString(),
          context: JSON.stringify(contextData),
        },
      };

      try {
        await createProposal.mutateAsync(backendData);
        toast.success('Proposal submitted successfully');
        setDialogOpen(true);
        setTrxHash(hash);
      }
      catch (proposalError: any) {
        console.error('Proposal creation failed:', proposalError);
        toast.error(`Failed to create proposal: ${proposalError.message}`);
      }
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
      console.error('Smart contract error:', e);
      toast.error(errorMessage);
    }
    setLoadingStatus(false);
  };

  // Show error state if there's a critical error
  if (_organizationsError) {
    return (
      <div className="container mt-20">
        <div className="mt-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-8">
            New Member Approval Proposal
          </h1>
          <div className="text-red-500 p-4 border border-red-500 rounded">
            <p>Error loading organizations. Please try refreshing the page.</p>
            <p className="text-sm mt-2">
              Error:
              {_organizationsError?.message || 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (organizationsLoading) {
    return (
      <div className="container mt-20">
        <div className="mt-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-8">
            New Member Approval Proposal
          </h1>
          <div className="text-white p-4">
            <p>Loading organizations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-20">
      <div className="mt-10">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          New Member Approval Proposal
        </h1>
        <form
          onSubmit={approveMember}
          className="w-1/3 mx-auto space-y-6 border border-gray-600 p-6 rounded-xl"
        >
          <div>
            <p>New Member Organization: </p>
            <Select
              value={data.organizationId}
              onValueChange={handleOrganizationSelect}
              required
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent>
                {_organizationsError
                  ? (
                      <SelectItem value="" disabled>
                        Error loading organizations
                      </SelectItem>
                    )
                  : organizationsData?.organizations?.map(org => (
                    <SelectItem key={org.id} value={org.id.toString()}>
                      {org.name}
                    </SelectItem>
                  )) || (
                    <SelectItem value="" disabled>
                      {organizationsLoading ? 'Loading...' : 'No organizations available'}
                    </SelectItem>
                  )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p>New Member Address: </p>
            <input
              className="w-full p-3 mt-2 bg-black border border-gray-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              type="text"
              name="_newMember"
              onChange={handleInput}
              placeholder="Enter address"
              required
            />
          </div>
          <div>
            <p>Description: </p>
            <textarea
              className="w-full p-3 mt-2 bg-black border border-gray-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              name="description"
              onChange={handleInput}
              placeholder="Enter description"
              rows={10}
              required
            >
            </textarea>
          </div>
          <div className="flex justify-center">
            <Button type="submit" isLoading={loadingStatus}>
              Place Proposal
            </Button>
          </div>
        </form>
      </div>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open)
            navigate('/organization/dao/proposals');
        }}
      >
        <DialogContent className="border-gray-700 bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-400 flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Proposal Submitted Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300">
              Your membership proposal has been successfully submitted to the blockchain and is now under review by DAO members.
            </p>
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Transaction Hash:</p>
              <div className="flex items-center gap-2">
                <code className="text-blue-400 text-sm bg-gray-900 p-2 rounded flex-1 break-all">
                  {shortenAddress(trxHash)}
                </code>
                <a
                  href={`${env.VITE_TRX_EXPLORER}/${trxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
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
            >
              View All Proposals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
