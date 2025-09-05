'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import { useUserOrg } from '@/features/dao-details/hooks/use-user-org';
import { Button } from '@/shared/components/ui/button';
import useAuthStore from '@/shared/stores/auth';

export default function ApprovalNotification() {
  const [isVisible, setIsVisible] = useState(true);
  const profile = useAuthStore(state => state.profile);
  const { data: orgData, isLoading, error } = useUserOrg();

  // Don't show if organization data is loading, has error, or notification is dismissed
  if (
    isLoading
    || error
    || !orgData
    || !profile
    || !isVisible
  ) {
    return null;
  }

  // Use organization's approval status instead of profile status
  const isApproved = orgData.status === 'approved';

  // Different styling based on organization status
  const containerClasses = isApproved
    ? 'bg-green-100 border-l-4 border-green-500 text-green-700 p-2 sticky top-20 z-40'
    : 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 sticky top-20 z-40';

  const iconColor = isApproved ? 'text-green-500' : 'text-yellow-500';
  const buttonClasses = isApproved
    ? 'text-green-700 hover:text-green-900 hover:bg-green-200'
    : 'text-yellow-700 hover:text-yellow-900 hover:bg-yellow-200';

  // Update messages to reflect organization status
  const message = isApproved
    ? `Your organization "${orgData.name}" has been approved! You can now participate in governance activities.`
    : `Your organization "${orgData.name}" is pending approval. You will be able to participate in governance once approved.`;

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
            <p className="text-sm font-medium">{message}</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
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
