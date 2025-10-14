import type { ChangeEvent, FormEvent } from 'react';
import type { ProposalOnchainVerificationPayload } from '@/core/services/proposal/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { simulateContract, writeContract } from '@wagmi/core';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
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
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

export default function MemberProposal() {
  const [data, setData] = useState({
    _newMember: '',
    description: '',
    organizationId: '',
  });
  const { address } = useAccount();
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

  const createOnchainVerification = useMutation({
    mutationFn: proposalApis.createOnchainVerification,
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

      const backendData = {
        proposal_type: 'membership',
        metadata: data.description,
        proposer_address: `0x${address}`,
        trx_hash: hash,
      };

      const userData: ProposalOnchainVerificationPayload = {
        trx_hash: hash,
        context: 'Membership Proposal',
        proposer_wallet: `${address}`,
        organization_id: Number.parseInt(data.organizationId),
      };

      try {
        await createProposal.mutateAsync(backendData);

        // Then create onchain verification - if this fails, log the error but don't fail silently
        try {
          await createOnchainVerification.mutateAsync(userData);
          toast.success('Proposal submitted and verified onchain successfully');
          setDialogOpen(true);
          setTrxHash(hash);
        }
        catch (verificationError: any) {
          console.error('Onchain verification failed:', verificationError);
          toast.error(
            `Proposal created but onchain verification failed: ${verificationError.message}`,
          );
          // Still show dialog since proposal was created successfully
          setDialogOpen(true);
          setTrxHash(hash);
        }
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
        <DialogContent>
          <DialogHeader>
            <h2 className="text-lg font-bold text-green-400">
              Proposal Submitted
            </h2>
          </DialogHeader>
          <p className="text-yellow-400">
            Your proposal has been successfully submitted and is under review.
            To check the transaction status,
            {' '}
            <a
              target="_"
              href={`${env.VITE_TRX_EXPLORER}/${trxHash}`}
              className="text-blue-400 underline"
            >
              click here
            </a>
          </p>
          <DialogFooter>
            <Button
              className="bg-blue-600 font-bold hover:bg-blue-700 text-white"
              onClick={() => navigate('/organization/dao/proposals')}
            >
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
