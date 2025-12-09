import { ConnectButton } from '@rainbow-me/rainbowkit';
import { writeContract } from '@wagmi/core';
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

import { config } from '@/core/config';
import contractABI from '@/core/contract/contract-abi.json';
import { env } from '@/core/env';
import { membershipApis } from '@/core/services/membership';
import { useUserOrg } from '@/features/dao-details/hooks/use-user-org';
import { Button } from '@/shared/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { useRefreshProfile } from '@/shared/hooks/use-refresh-profile';
import useAuthStore from '@/shared/stores/auth';

export default function StatusIndicators() {
  const profile = useAuthStore(state => state.profile);
  const { data: orgData, isLoading: isOrgLoading } = useUserOrg();
  const { address, isConnected } = useAccount();
  const refreshProfile = useRefreshProfile();

  const [isMemberApproved, setIsMemberApproved] = useState<boolean>();
  const [isCheckingMembership, setIsCheckingMembership] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserPopoverOpen, setIsUserPopoverOpen] = useState(false);
  const [isOrgPopoverOpen, setIsOrgPopoverOpen] = useState(false);

  // Check membership approval status
  useEffect(() => {
    const checkMembershipStatus = async () => {
      if (!orgData || !address || !isConnected) {
        return;
      }

      setIsCheckingMembership(true);
      try {
        const response = await membershipApis.checkMemberApproval({ address });
        setIsMemberApproved(response);
      }
      catch (error) {
        console.error('Failed to check membership status:', error);
        setIsMemberApproved(false);
      }
      finally {
        setIsCheckingMembership(false);
      }
    };

    checkMembershipStatus();
  }, [orgData?.offchain_status, address, isConnected, orgData?.id]);

  const checkMembershipStatus = async () => {
    if (!orgData || !address || !isConnected) {
      return;
    }

    setIsCheckingMembership(true);
    try {
      const response = await membershipApis.checkMemberApproval({ address });
      setIsMemberApproved(response);
    }
    catch (error) {
      console.error('Failed to check membership status:', error);
      setIsMemberApproved(false);
    }
    finally {
      setIsCheckingMembership(false);
    }
  };

  const handleApplyForMembership = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!orgData || !profile) {
      toast.error('Organization or profile data not available');
      return;
    }

    setIsSubmitting(true);

    try {
      toast.info('Initiating membership registration...');

      const contractAddress = env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS as `0x${string}`;

      const hash = await writeContract(config, {
        address: contractAddress,
        abi: contractABI,
        functionName: 'registerMember',
        args: [address, orgData.legal_entity_identifier],
      });

      toast.success(`Membership application submitted! Transaction hash: ${hash.slice(0, 10)}...`);
      setIsOrgPopoverOpen(false);
      // Refresh membership status after a delay
      setTimeout(() => {
        checkMembershipStatus();
      }, 3000);
    }
    catch (error) {
      console.error('Error during membership application:', error);

      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        if (
          errorMessage.includes('already a member')
          || errorMessage.includes('execution reverted: already a member')
        ) {
          toast.warning('You are already a member of this organization!');
        }
        else if (errorMessage.includes('user rejected') || errorMessage.includes('user denied')) {
          toast.error('Transaction was rejected');
        }
        else if (errorMessage.includes('insufficient funds')) {
          toast.error('Insufficient funds for transaction');
        }
        else {
          toast.error(`Failed to apply for membership: ${error.message}`);
        }
      }
      else {
        toast.error('Failed to apply for membership. Please try again.');
      }
    }
    finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return null;
  }

  const isUserApproved = profile.status === 'approved';
  const isOrgApproved = orgData?.offchain_status === 'approved';

  // Determine user status
  const userStatusConfig = isUserApproved
    ? {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10 hover:bg-green-500/20',
        borderColor: 'border-green-500/20',
        label: 'Account Approved',
        message: 'Your account has been approved! You now have full access to all features.',
      }
    : {
        icon: AlertCircle,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20',
        borderColor: 'border-yellow-500/20',
        label: 'Pending Approval',
        message: 'Your account is currently being reviewed. Please wait while we verify your information.',
      };

  // Determine org/membership status
  let orgStatusConfig;
  if (isOrgLoading) {
    orgStatusConfig = {
      icon: Loader2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      borderColor: 'border-blue-500/20',
      label: 'Loading...',
      message: 'Loading organization status...',
      showAction: false,
    };
  }
  else if (!isOrgApproved && isMemberApproved === true) {
    orgStatusConfig = {
      icon: AlertCircle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20',
      borderColor: 'border-yellow-500/20',
      label: 'Org Pending',
      message: `You are already a member, but your organization "${orgData?.name}" is waiting for approval.`,
      showAction: false,
    };
  }
  else if (!isOrgApproved) {
    orgStatusConfig = {
      icon: AlertCircle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20',
      borderColor: 'border-yellow-500/20',
      label: 'Org Pending',
      message: `Your organization "${orgData?.name}" is currently under review.`,
      showAction: false,
    };
  }
  else if (isCheckingMembership) {
    orgStatusConfig = {
      icon: Loader2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      borderColor: 'border-blue-500/20',
      label: 'Checking...',
      message: 'Checking membership status...',
      showAction: false,
    };
  }
  else if (isMemberApproved === true) {
    orgStatusConfig = {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10 hover:bg-green-500/20',
      borderColor: 'border-green-500/20',
      label: 'Member Active',
      message: 'Your membership has been approved. You can now access all features.',
      showAction: false,
    };
  }
  else {
    orgStatusConfig = {
      icon: AlertCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      borderColor: 'border-blue-500/20',
      label: 'Apply for Membership',
      message: `Your organization "${orgData?.name}" has been approved! You can now apply for membership.`,
      showAction: true,
    };
  }

  const UserIcon = userStatusConfig.icon;
  const OrgIcon = orgStatusConfig.icon;

  return (
    <div className="flex items-center gap-2">
      {/* User Status Indicator */}
      <Popover open={isUserPopoverOpen} onOpenChange={setIsUserPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 sm:px-3 gap-1.5 ${userStatusConfig.bgColor} border ${userStatusConfig.borderColor}`}
          >
            <UserIcon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${userStatusConfig.color} flex-shrink-0`} />
            <span className="text-xs font-medium hidden sm:inline">{userStatusConfig.label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 z-[100]" align="end">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <UserIcon className={`h-5 w-5 ${userStatusConfig.color} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-sm">{userStatusConfig.label}</h4>
                <p className="text-sm text-muted-foreground">{userStatusConfig.message}</p>
                {!isUserApproved && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshProfile.mutate()}
                    disabled={refreshProfile.isPending}
                    className="w-full gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshProfile.isPending ? 'animate-spin' : ''}`} />
                    {refreshProfile.isPending ? 'Checking...' : 'Refresh Status'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Organization/Membership Status Indicator */}
      {orgData && (
        <Popover open={isOrgPopoverOpen} onOpenChange={setIsOrgPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 sm:px-3 gap-1.5 ${orgStatusConfig.bgColor} border ${orgStatusConfig.borderColor}`}
            >
              <OrgIcon
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${orgStatusConfig.color} flex-shrink-0 ${isOrgLoading || isCheckingMembership ? 'animate-spin' : ''}`}
              />
              <span className="text-xs font-medium hidden sm:inline">{orgStatusConfig.label}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 z-[100]" align="end">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <OrgIcon
                  className={`h-5 w-5 ${orgStatusConfig.color} flex-shrink-0 mt-0.5 ${isOrgLoading || isCheckingMembership ? 'animate-spin' : ''}`}
                />
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold text-sm">{orgStatusConfig.label}</h4>
                  <p className="text-sm text-muted-foreground">{orgStatusConfig.message}</p>
                  {orgStatusConfig.showAction && (
                    !isConnected
                      ? (
                          <ConnectButton.Custom>
                            {({ openConnectModal }) => (
                              <Button
                                onClick={openConnectModal}
                                className="w-full"
                                size="sm"
                              >
                                Connect Wallet to Apply
                              </Button>
                            )}
                          </ConnectButton.Custom>
                        )
                      : (
                          <Button
                            onClick={handleApplyForMembership}
                            disabled={isSubmitting}
                            className="w-full"
                            size="sm"
                          >
                            {isSubmitting
                              ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Applying...
                                  </>
                                )
                              : 'Apply for Membership'}
                          </Button>
                        )
                  )}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
