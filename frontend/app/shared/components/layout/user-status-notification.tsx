import { AlertCircle, CheckCircle, RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useRefreshProfile } from '@/shared/hooks/use-refresh-profile';
import useAuthStore from '@/shared/stores/auth';

export default function UserStatusNotification() {
  const [isVisible, setIsVisible] = useState(true);
  const profile = useAuthStore(state => state.profile);
  const refreshProfile = useRefreshProfile();

  // Check if approval notification has been shown for this user
  const getApprovalNotificationKey = () => profile?.id ? `user-approved-notification-shown-${profile.id}` : '';
  const hasShownApprovedNotification = profile?.id ? localStorage.getItem(getApprovalNotificationKey()) === 'true' : false;

  // Mark approved notification as shown when status changes to approved
  useEffect(() => {
    if (profile?.id && profile.status === 'approved' && !hasShownApprovedNotification) {
      // Auto-dismiss after 5 seconds for approved status
      const timer = setTimeout(() => {
        localStorage.setItem(getApprovalNotificationKey(), 'true');
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [profile?.id, profile?.status, hasShownApprovedNotification]);

  const handleDismiss = () => {
    if (profile?.id && profile.status === 'approved') {
      localStorage.setItem(getApprovalNotificationKey(), 'true');
    }
    setIsVisible(false);
  };

  // Only show if user profile exists and status is pending or (approved and not yet shown)
  if (!profile || !isVisible
    || (profile.status !== 'pending'
      && !(profile.status === 'approved' && !hasShownApprovedNotification))) {
    return null;
  }

  const isApproved = profile.status === 'approved';

  // Different styles based on status
  const containerClasses = isApproved
    ? 'bg-green-100 border-l-4 border-green-500 text-green-700 p-3 fixed top-0 left-0 right-0 z-[60] w-full'
    : 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 fixed top-0 left-0 right-0 z-[60] w-full';

  const iconColor = isApproved ? 'text-green-500' : 'text-yellow-500';
  const buttonClasses = isApproved
    ? 'text-green-700 hover:text-green-900 hover:bg-green-200'
    : 'text-yellow-700 hover:text-yellow-900 hover:bg-yellow-200';

  const message = isApproved
    ? 'Your account has been approved! You now have full access to all features.'
    : 'Your account is currently being reviewed. Please wait while we verify your information.';

  const IconComponent = isApproved ? CheckCircle : AlertCircle;

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <IconComponent className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium">
              {message}
              {!isApproved && (
                <button
                  type="button"
                  onClick={() => refreshProfile.mutate()}
                  disabled={refreshProfile.isPending}
                  className="ml-2 text-xs underline hover:no-underline disabled:opacity-50"
                >
                  {refreshProfile.isPending ? 'Checking...' : ''}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-1">
          {!isApproved && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refreshProfile.mutate()}
              disabled={refreshProfile.isPending}
              className={buttonClasses}
              title="Refresh status"
            >
              <RefreshCw className={`h-4 w-4 ${refreshProfile.isPending ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh status</span>
            </Button>
          )}
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
