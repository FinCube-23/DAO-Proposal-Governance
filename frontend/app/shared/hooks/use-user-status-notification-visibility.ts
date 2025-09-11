import { useEffect, useState } from 'react';
import useAuthStore from '@/shared/stores/auth';

export function useUserStatusNotificationVisibility() {
  const profile = useAuthStore(state => state.profile);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Listen for notification dismissal events
  useEffect(() => {
    const handleDismissal = () => {
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('userStatusNotificationDismissed', handleDismissal);
    return () => {
      window.removeEventListener('userStatusNotificationDismissed', handleDismissal);
    };
  }, []);

  // Calculate visibility (forceUpdate ensures this re-runs when localStorage changes)
  const isVisible = (() => {
    if (!profile) return false;

    // For pending users, notification is always visible
    if (profile.status === 'pending') {
      return true;
    }

    // For approved users, check if notification has been shown/dismissed
    if (profile.status === 'approved') {
      const approvalNotificationKey = `user-approved-notification-shown-${profile.id}`;
      const hasShownApprovedNotification = localStorage.getItem(approvalNotificationKey) === 'true';
      return !hasShownApprovedNotification;
    }

    return false;
  })();

  // Use forceUpdate as dependency to trigger re-calculation
  return forceUpdate >= 0 ? isVisible : isVisible;
}
