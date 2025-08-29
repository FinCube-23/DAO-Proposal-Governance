import type { FetchMeResponse } from '@/core/api/types';
import type { Organization, UserOrgs } from '@/core/services/org/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TokenPayload {
  access: string;
}

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  contact_number: string;
  is_active: boolean;
  is_staff: boolean;
  status: string;
  organizations: UserOrgs[] | null;
}

interface AuthStoreState {
  access: string | null;
  profile: UserProfile | null;

  setTokens: (payload: TokenPayload | null) => void;
  setProfile: (payload: FetchMeResponse | null) => void;
  setOrg: (org: Organization | null) => void;
  setOrgTrxHash: (hash: string | null) => void;
  clearAuthState: () => void;
}

const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      access: null,
      profile: null,

      setTokens: payload =>
        set({ access: payload?.access || null }),

      setProfile: (payload) => {
        if (!payload) {
          set({ profile: null });
          return;
        }

        // Map API response to internal profile format
        // If user has organizations, use the first one (assume they only have one for now)
        const profile: UserProfile = {
          id: payload.id,
          email: payload.email,
          first_name: payload.first_name,
          last_name: payload.last_name,
          contact_number: payload.contact_number,
          is_active: payload.is_active,
          is_staff: payload.is_staff,
          status: payload.status,
          organizations: payload.organizations,
        };

        set({ profile });
      },

      setOrg: (org) => {
        const profile = get().profile;
        if (profile && org) {
          const currentOrgs = profile.organizations || [];
          const userOrg: UserOrgs = {
            id: org.id,
            name: org.name,
            is_admin: org.organization_admin_id === profile.id,
          };
          const updatedOrgs = [...currentOrgs, userOrg];
          set({
            profile: {
              ...profile,
              organizations: updatedOrgs,
            },
          });
        }
      },

      setOrgTrxHash: (hash) => {
        // Note: UserOrgs doesn't contain trx_hash field, so this is a no-op
        // If needed, extend UserOrgs interface to include trx_hash
        const _ = hash; // Prevent unused parameter warning
      },

      clearAuthState: () => set({ access: null, profile: null }),
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: state => ({
        access: state.access,
        profile: state.profile,
      }),
    },
  ),
);

export default useAuthStore;
