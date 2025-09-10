import { useQuery } from '@tanstack/react-query';
import { orgApis } from '@/core/services/org';
import useAuthStore from '@/shared/stores/auth';

export function useUserOrg() {
  const profile = useAuthStore(state => state.profile);

  return useQuery({
    queryKey: ['user-org', profile?.id],
    queryFn: () => {
      if (!profile?.id) {
        throw new Error('User ID not available');
      }
      return orgApis.getOrg(profile.id);
    },
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
