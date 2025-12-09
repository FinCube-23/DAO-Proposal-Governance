import type { ChangeEvent, FormEvent } from 'react';
import type { ProposalCreatePayload } from '@/core/services/proposal/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { simulateContract, writeContract } from '@wagmi/core';
import { AlertCircle, ArrowLeft, Check, CheckCircle, Copy, Loader2 } from 'lucide-react';
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isCopied, setIsCopied] = useState(false);
  const navigate = useNavigate();

  // Fetch organizations
  const {
    data: organizationsData,
    isLoading: organizationsLoading,
    error: _organizationsError,
  } = useQuery({
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

  const handleCopyHash = async () => {
    await navigator.clipboard.writeText(trxHash);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Form validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!data.organizationId) {
      newErrors.organizationId = 'Please select an organization';
    }

    if (!data._newMember.trim()) {
      newErrors._newMember = 'Member address is required';
    }
    else if (!data._newMember.match(/^0x[a-fA-F0-9]{40}$/)) {
      newErrors._newMember = 'Please enter a valid Ethereum address';
    }

    if (!data.description.trim()) {
      newErrors.description = 'Description is required';
    }
    else if (data.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }

    if (!address) {
      newErrors.wallet = 'Please connect your wallet';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const approveMember = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoadingStatus(true);
    setErrors({});

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
        __typename: 'ProposalAdded',
        description: data.description,
        organizationId: Number.parseInt(data.organizationId),
        proposalType: 'membership',
      };

      const backendData: ProposalCreatePayload = {
        proposal_type: 'membership',
        onChainData: {
          transactionHash: hash,
          signedBy: address || '',
          signedWith: 'metamask',
          chainId: chainId.toString(),
          context: contextData,
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
      <div className="container px-4 sm:px-6 mt-10 sm:mt-20">
        <div className="mt-6 sm:mt-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">
            New Member Approval Proposal
          </h1>
          <div className="text-red-500 p-4 border border-red-500 rounded text-sm sm:text-base">
            <p>Error loading organizations. Please try refreshing the page.</p>
            <p className="text-xs sm:text-sm mt-2">
              Error:
              {' '}
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
      <div className="container px-4 sm:px-6 mt-10 sm:mt-20">
        <div className="mt-6 sm:mt-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">
            New Member Approval Proposal
          </h1>
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-sm text-gray-400">Loading organizations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-6 mt-10 sm:mt-20">
      <div className="mt-6 sm:mt-10">
        <div className="flex items-center justify-center mb-6 sm:mb-8 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="absolute left-0 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            New Member Approval Proposal
          </h1>
        </div>

        {errors.wallet && (
          <div className="w-full sm:w-2/3 lg:w-1/2 xl:w-1/3 mx-auto mb-4">
            <div className="p-4 border border-red-500 bg-red-500/10 rounded-lg">
              <p className="text-red-400 text-sm">{errors.wallet}</p>
            </div>
          </div>
        )}

        <form
          onSubmit={approveMember}
          className="w-full sm:w-2/3 lg:w-1/2 xl:w-1/3 mx-auto space-y-4 sm:space-y-6 border border-gray-600 p-4 sm:p-6 rounded-xl"
        >
          <div>
            <p className="text-sm sm:text-base">
              New Member Organization
              <span className="text-red-400"> *</span>
            </p>
            <Select
              value={data.organizationId}
              onValueChange={handleOrganizationSelect}
            >
              <SelectTrigger className={`w-full mt-2 text-sm sm:text-base bg-background ${
                errors.organizationId ? 'border-red-500' : ''
              }`}
              >
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent>
                {_organizationsError
                  ? (
                      <SelectItem value="" disabled>
                        Error loading organizations
                      </SelectItem>
                    )
                  : (
                      organizationsData?.organizations
                        ?.filter(org => !org.name.toLowerCase().includes('brain station 23'))
                        ?.map(org => (
                          <SelectItem key={org.id} value={org.id.toString()}>
                            {org.name}
                          </SelectItem>
                        )) || (
                        <SelectItem value="" disabled>
                          No organizations available
                        </SelectItem>
                      )
                    )}
              </SelectContent>
            </Select>
            {errors.organizationId && (
              <p className="text-red-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.organizationId}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm sm:text-base">
              New Member Address
              <span className="text-red-400"> *</span>
            </p>
            <input
              className={`w-full p-2 sm:p-3 mt-2 bg-background border text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base ${
                errors._newMember ? 'border-red-500' : 'border-gray-600'
              }`}
              type="text"
              name="_newMember"
              onChange={handleInput}
              placeholder="Enter address"
            />
            {errors._newMember && (
              <p className="text-red-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors._newMember}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm sm:text-base">
              Description
              <span className="text-red-400"> *</span>
            </p>
            <textarea
              className={`w-full p-2 sm:p-3 mt-2 bg-background border text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none text-sm sm:text-base ${
                errors.description ? 'border-red-500' : 'border-gray-600'
              }`}
              name="description"
              onChange={handleInput}
              placeholder="Enter description"
              rows={8}
            />
            <div className="flex justify-between text-xs sm:text-sm text-gray-400 mt-1">
              <span>
                {data.description.length}
                {' '}
                characters
              </span>
              <span>Minimum 10 characters</span>
            </div>
            {errors.description && (
              <p className="text-red-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description}
              </p>
            )}
          </div>
          <div className="flex justify-center">
            <Button
              type="submit"
              isLoading={loadingStatus}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
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
        <DialogContent className="border-gray-700 bg-gray-900 w-[95vw] max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-green-400 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              Proposal Submitted Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300 text-sm sm:text-base">
              Your membership proposal has been successfully submitted to the
              blockchain and is now under review by DAO members.
            </p>
            <div className="p-3 sm:p-4 bg-gray-800 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-400 mb-2">
                Transaction Hash:
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <code className="text-blue-400 text-xs sm:text-sm bg-gray-900 p-2 rounded flex-1 break-all">
                    {shortenAddress(trxHash)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyHash}
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    {isCopied
                      ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        )
                      : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                  </Button>
                </div>
                <a
                  href={`${env.VITE_TRX_EXPLORER}/${trxHash}`}
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
          <DialogFooter className="!flex !flex-row !justify-center !items-center">
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
