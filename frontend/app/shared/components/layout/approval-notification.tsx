import type { OnchainVerificationPayload } from '@/core/services/org/types';

import { writeContract } from '@wagmi/core';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAccount } from 'wagmi';
import { config } from '@/core/config';
import contractABI from '@/core/contract/contract-abi.json';
import { env } from '@/core/env';
import { membershipApis } from '@/core/services/membership';
import { orgApis } from '@/core/services/org';
import { useUserOrg } from '@/features/dao-details/hooks/use-user-org';
import { Button } from '@/shared/components/ui/button';
import useAuthStore from '@/shared/stores/auth';

export default function ApprovalNotification() {
  const [isVisible, setIsVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMemberApproved, setIsMemberApproved] = useState<boolean>();
  const [isCheckingMembership, setIsCheckingMembership] = useState(false);
  const profile = useAuthStore(state => state.profile);
  const { data: orgData, isLoading, error } = useUserOrg();
  const { address, isConnected } = useAccount();

  // Check if membership approval notification has been shown for this user
  const getMembershipApprovalKey = () => 
    profile?.id && orgData?.id ? `membership-approved-notification-shown-${profile.id}-${orgData.id}` : '';
  const hasShownMembershipApproval = profile?.id && orgData?.id ? 
    localStorage.getItem(getMembershipApprovalKey()) === 'true' : false;

  // Check membership approval status when organization is approved and wallet is connected
  useEffect(() => {
    console.warn('useEffect triggered with:', {
      orgDataExists: !!orgData,
      orgStatus: orgData?.status,
      address,
      isConnected,
    });

    const checkMembershipStatus = async () => {
      if (!orgData || !address || !isConnected) {
        console.warn('Skipping membership check:', {
          hasOrgData: !!orgData,
          hasAddress: !!address,
          isConnected,
        });
        return;
      }

      console.warn('Checking membership status for address:', address);
      setIsCheckingMembership(true);
      try {
        const response = await membershipApis.checkMemberApproval({ address });
        console.warn('Membership check response:', response);
        setIsMemberApproved(response);
      }
      catch (error) {
        console.error('Failed to check membership status:', error);
        // If the API endpoint doesn't exist (404), we'll assume membership needs to be applied for
        setIsMemberApproved(false);
      }
      finally {
        setIsCheckingMembership(false);
      }
    };

    checkMembershipStatus();
  }, [orgData?.status, address, isConnected, orgData?.id]); // Added orgData?.id to dependencies

  // Auto-dismiss membership approval notification after 5 seconds
  useEffect(() => {
    if (orgData?.status === 'approved' && isMemberApproved === true && !hasShownMembershipApproval) {
      const timer = setTimeout(() => {
        localStorage.setItem(getMembershipApprovalKey(), 'true');
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [orgData?.status, isMemberApproved, hasShownMembershipApproval]);

  const handleDismiss = () => {
    if (orgData?.status === 'approved' && isMemberApproved === true) {
      localStorage.setItem(getMembershipApprovalKey(), 'true');
    }
    setIsVisible(false);
  };

  if (
    isLoading
    || error
    || !orgData
    || !profile
    || !isVisible
    || (orgData.status === 'approved' && isMemberApproved === true && hasShownMembershipApproval) // Hide if membership approval already shown
  ) {
    return null;
  }

  const isApproved = orgData.status === 'approved';

  // Calculate top position based on whether user status notification is shown
  const hasUserStatusNotification = profile.status === 'pending' || profile.status === 'approved';
  const topPosition = hasUserStatusNotification ? 'top-[120px]' : 'top-20';

  // Determine the message based on organization and membership status
  let messageText = '';
  let showApplyButton = false;

  console.warn('Debug values:', {
    isApproved,
    isMemberApproved,
    isCheckingMembership,
    orgStatus: orgData.status,
    hasAddress: !!address,
    isConnected,
    membershipCheckStatus: isMemberApproved === null ? 'not_checked' : isMemberApproved === false ? 'not_approved' : 'approved',
  });

  if (!isApproved && isMemberApproved === true) {
    // User is already a member but organization is not approved
    messageText = `You are already a member, but wait for your organization "${orgData.name}" approval.`;
  }
  else if (!isApproved) {
    // Organization not approved and user is not a member (or membership unknown)
    messageText = `Your organization "${orgData.name}" is currently under review. Please wait while we process your application.`;
  }
  else if (isCheckingMembership) {
    // Organization approved but still checking membership status
    messageText = `Your organization "${orgData.name}" has been approved! Checking membership status...`;
  }
  else if (isMemberApproved === true) {
    // Both organization and membership are approved
    messageText = `Your membership has been approved. You can now access all the features.`;
  }
  else {
    // Organization approved but membership not approved (includes false, null, or undefined)
    messageText = `Your organization "${orgData.name}" has been approved! You may now`;
    showApplyButton = true;
  }

  const containerClasses = isApproved
    ? `bg-green-100 border-l-4 border-green-500 text-green-700 p-2 sticky ${topPosition} z-40`
    : `bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 sticky ${topPosition} z-40`;

  const iconColor = isApproved ? 'text-green-500' : 'text-yellow-500';
  const buttonClasses = isApproved
    ? 'text-green-700 hover:text-green-900 hover:bg-green-200'
    : 'text-yellow-700 hover:text-yellow-900 hover:bg-yellow-200';

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
        args: [
          address,
          orgData.legal_entity_identifier,
        ],
      });

      toast.success('Your membership application is pending');

      const verificationPayload: OnchainVerificationPayload = {
        trx_hash: hash,
        context: {
          org_admin_name: `${profile.first_name} ${profile.last_name}`,
          org_admin_email: profile.email,
          org: {
            name: orgData.name,
            type: orgData.type,
            address: orgData.address,
            legal_entity_identifier: orgData.legal_entity_identifier,
          },
        },
        proposer_wallet: address,
        organization_id: orgData.id,
      };

      const response = await orgApis.submitOnchainVerification(verificationPayload);

      console.warn('API response:', response);
      toast.warning('Your on-chain membership application is pending.');

      setIsVisible(false);
    }
    catch (error) {
      console.error('Error during membership application:', error);

      // Log the full error for debugging
      if (error instanceof Error) {
        console.warn('Full error message:', error.message);
        console.warn('Error name:', error.name);
        console.warn('Error stack:', error.stack);
      }

      // Handle specific smart contract errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        // Check for "Already a member" error from smart contract
        if (errorMessage.includes('already a member')
          || errorMessage.includes('execution reverted: already a member')
          || errorMessage.includes('revert already a member')
          || errorMessage.includes('already member')
          || errorMessage.includes('member already exists')
          || errorMessage.includes('duplicate member')
          || (errorMessage.includes('vm execution error') && errorMessage.includes('already a member'))
          || (errorMessage.includes('fail with error') && errorMessage.includes('already a member'))) {
          toast.warning('You are already a member of this organization!');
          // Don't hide the notification for this case since user might want to try again later
          return;
        }
        // Check for other common smart contract errors
        else if (errorMessage.includes('user rejected')
          || errorMessage.includes('user denied transaction')
          || errorMessage.includes('user cancelled')) {
          toast.error('Transaction was rejected by user');
        }
        else if (errorMessage.includes('insufficient funds')
          || errorMessage.includes('insufficient balance')
          || errorMessage.includes('insufficient gas')) {
          toast.error('Insufficient funds for transaction');
        }
        else if (errorMessage.includes('network error')
          || errorMessage.includes('connection error')) {
          toast.error('Network error. Please check your connection and try again');
        }
        else {
          // Generic error with the actual error message
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

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {isApproved
              ? (
                  <svg
                    className={`h-5 w-5 ${iconColor}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )
              : (
                // Warning icon for pending
                  <svg
                    className={`h-5 w-5 ${iconColor}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium">
              {messageText}
              {showApplyButton && (
                <>
                  {' '}
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleApplyForMembership}
                    disabled={isSubmitting || !isConnected}
                    className="p-0 h-auto text-sm font-bold underline text-green-700 hover:text-green-900 disabled:opacity-50"
                  >
                    {isSubmitting
                      ? 'Applying...'
                      : !isConnected
                          ? 'Connect wallet to apply'
                          : 'apply for membership'}
                  </Button>
                  {!isSubmitting && '.'}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className={buttonClasses}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
