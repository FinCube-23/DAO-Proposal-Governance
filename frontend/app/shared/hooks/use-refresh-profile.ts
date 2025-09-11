import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMe } from '@/features/auth/apis/fetch-me';
import useAuthStore from '@/shared/stores/auth';

export function useRefreshProfile() {
  const queryClient = useQueryClient();
  const setProfile = useAuthStore(state => state.setProfile);

  return useMutation({
    mutationKey: ['refreshProfile'],
    mutationFn: fetchMe,
    onSuccess: (data) => {
      setProfile(data);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['user-org'] });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
    onError: (error) => {
      console.error('Failed to refresh profile:', error);
    },
  });
}
