import { useQuery } from '@tanstack/react-query';
import { orgApis } from '@/core/services/org';
import useAuthStore from '@/shared/stores/auth';

export function useUserOrg() {
  const profile = useAuthStore(state => state.profile);
  return useQuery({
    queryKey: ['user-org', profile?.id],
    queryFn: () => {
      if (!profile?.organizations || profile?.organizations.length === 0) {
        throw new Error('User has no organizations');
      }

      // If user has only 1 organization and it's the default "Brain Station 23", show error
      if (profile?.organizations.length === 1) {
        throw new Error('User has no external organizations');
      }

      // If user has multiple organizations, find the non-default one
      // Look for an organization that's not "Brain Station 23"
      const nonDefaultOrg = profile.organizations.find(org => org.name !== 'Brain Station 23');

      if (nonDefaultOrg) {
        return orgApis.getOrg(nonDefaultOrg.id);
      }

      // Fallback: if all organizations are default (shouldn't happen), get the last one
      return orgApis.getOrg(profile.organizations[profile.organizations.length - 1].id);
    },
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
