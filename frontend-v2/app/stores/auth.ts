import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type FetchMeResponse, type Organization } from "@/lib/api/types";

type TokenPayload = {
  access: string;
};

type ProfilePayload = FetchMeResponse;

interface AuthStoreState {
  access: string | null;
  profile: ProfilePayload | null;

  setTokens: (payload: TokenPayload | null) => void;
  setProfile: (payload: ProfilePayload | null) => void;
  setMfsBusiness: (org: Organization | null) => void;
  setMfsBusinessTrxHash: (hash: string | null) => void;
  clearAuthState: () => void;
}

const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      access: null,
      profile: null,

      setTokens: (payload) =>
        set({ access: payload?.access || null }),

      setProfile: (payload) =>
        set({ profile: payload }),

      setMfsBusiness: (org) => {
        const profile = get().profile;
        if (profile) {
          set({
            profile: {
              ...profile,
              organization: org,
            },
          });
        }
      },

      setMfsBusinessTrxHash: (hash) => {
        const profile = get().profile;
        if (profile?.organization) {
          set({
            profile: {
              ...profile,
              organization: {
                ...profile.organization,
                trx_hash: hash,
              },
            },
          });
        }
      },

      clearAuthState: () => set({ access: null, profile: null }),
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({
        access: state.access,
        profile: state.profile,
      }),
    }
  )
);

export default useAuthStore;
