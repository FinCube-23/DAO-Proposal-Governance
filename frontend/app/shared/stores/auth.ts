import type { UserOrgs } from '@/core/services/org/types';
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
  wallet_address?: string;
  is_active: boolean;
  is_staff: boolean;
  status: string;
  organizations: UserOrgs[];
}

interface AuthStoreState {
  access: string | null;
  profile: UserProfile | null;

  setTokens: (payload: TokenPayload | null) => void;
  setProfile: (payload: UserProfile | null) => void;
  updateWalletAddress: (walletAddress: string) => void;
  setOrg: (org: UserOrgs | null) => void;
  setOrgTrxHash: (hash: string | null) => void;
  sortOrganizations: () => void;
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

        // Sort organizations to keep Brain Station 23 at index 1
        let sortedOrganizations = payload.organizations || [];
        if (sortedOrganizations.length > 1) {
          const brainStationIndex = sortedOrganizations.findIndex(org => org.name === "Brain Station 23");
          if (brainStationIndex !== -1 && brainStationIndex !== 1) {
            sortedOrganizations = [...sortedOrganizations];
            // Remove Brain Station 23 from its current position
            const brainStationOrg = sortedOrganizations.splice(brainStationIndex, 1)[0];
            // Insert it at index 1
            const targetIndex = Math.min(1, sortedOrganizations.length);
            sortedOrganizations.splice(targetIndex, 0, brainStationOrg);
          }
        }

        const profile: UserProfile = {
          id: payload.id,
          email: payload.email,
          first_name: payload.first_name,
          last_name: payload.last_name,
          contact_number: payload.contact_number,
          wallet_address: payload.wallet_address,
          is_active: payload.is_active,
          is_staff: payload.is_staff,
          status: payload.status,
          organizations: sortedOrganizations,
        };

        set({ profile });
      },

      updateWalletAddress: (walletAddress: string) => {
        const profile = get().profile;
        if (profile) {
          set({
            profile: {
              ...profile,
              wallet_address: walletAddress,
            },
          });
        }
      },

      setOrg: (org) => {
        const profile = get().profile;
        if (profile && org) {
          const currentOrgs = profile.organizations || [];
          const userOrg: UserOrgs = {
            id: org.id,
            name: org.name,
            is_admin: org.is_admin,
          };
          const updatedOrgs = [...currentOrgs, userOrg];
          
          // Sort organizations to keep "Brain Station 23" at index 1 (second position)
          const sortedOrgs = updatedOrgs.sort((a, b) => {
            // If one of them is "Brain Station 23", prioritize it for index 1
            if (a.name === "Brain Station 23" && b.name !== "Brain Station 23") {
              return updatedOrgs.length === 1 ? 0 : 1; // Put at index 1 if there are multiple orgs
            }
            if (b.name === "Brain Station 23" && a.name !== "Brain Station 23") {
              return updatedOrgs.length === 1 ? 0 : -1; // Put Brain Station 23 at index 1
            }
            // For other organizations, maintain their relative order
            return 0;
          });
          
          // If we have more than 1 org and Brain Station 23 exists, ensure proper positioning
          if (sortedOrgs.length > 1) {
            const brainStationIndex = sortedOrgs.findIndex(org => org.name === "Brain Station 23");
            if (brainStationIndex !== -1 && brainStationIndex !== 1) {
              // Remove Brain Station 23 from its current position
              const brainStationOrg = sortedOrgs.splice(brainStationIndex, 1)[0];
              // Insert it at index 1 (or at the end if there's only 1 other org)
              const targetIndex = Math.min(1, sortedOrgs.length);
              sortedOrgs.splice(targetIndex, 0, brainStationOrg);
            }
          }
          
          set({
            profile: {
              ...profile,
              organizations: sortedOrgs,
            },
          });
        }
      },

      setOrgTrxHash: (hash) => {
        // Note: UserOrgs doesn't contain trx_hash field, so this is a no-op
        // If needed, extend UserOrgs interface to include trx_hash
        const _ = hash; // Prevent unused parameter warning
      },

      sortOrganizations: () => {
        const profile = get().profile;
        if (profile && profile.organizations && profile.organizations.length > 1) {
          const orgs = [...profile.organizations];
          
          // Find Brain Station 23 and move it to index 1
          const brainStationIndex = orgs.findIndex(org => org.name === "Brain Station 23");
          if (brainStationIndex !== -1 && brainStationIndex !== 1) {
            // Remove Brain Station 23 from its current position
            const brainStationOrg = orgs.splice(brainStationIndex, 1)[0];
            // Insert it at index 1 (or at the end if there's only 1 other org)
            const targetIndex = Math.min(1, orgs.length);
            orgs.splice(targetIndex, 0, brainStationOrg);
            
            set({
              profile: {
                ...profile,
                organizations: orgs,
              },
            });
          }
        }
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
