import { useQuery } from '@tanstack/react-query';
import { orgApis } from '@/core/services/org';
import useAuthStore from '@/shared/stores/auth';

export function useUserOrg() {
  const profile = useAuthStore(state => state.profile);
  return useQuery({
    queryKey: ['user-org', profile?.id],
    queryFn: () => {
      if (profile?.organizations && profile?.organizations.length <= 1) {
        throw new Error('User has no external organizations');
      }
      else if (profile?.organizations && profile?.organizations.length > 1) {
        return orgApis.getOrg(profile?.organizations[0].id);
      }
      throw new Error('User has no organizations');
    },
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
