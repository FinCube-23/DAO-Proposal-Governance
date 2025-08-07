export type CreateOrgPayload = {
  name: string;
  email: string;
  context: string;
  type: string;
  location: string;
  wallet_address: string;
  native_currency: string;
  certificate: string;
};

export type CreateOrgResponse = CreateOrgPayload & {
  id: number;
  is_approved: boolean;
  trx_hash: string | null;
};

export type UpdateOrgPayload = {
  id: number;
  name?: string;
  email?: string;
  context?: string;
  type?: string;
  location?: string;
  wallet_address?: string;
  native_currency?: string;
  certificate?: string;
  trx_hash?: string;
};

export type UpdateOrgResponse = UpdateOrgPayload;

export type Organization = {
  id: number;
  name: string;
  email: string;
  context: string;
  type: string;
  location: string;
  is_approved: boolean;
  wallet_address: string;
  native_currency: string;
  certificate: string;
  trx_hash: string | null;
  membership_onchain_status: string;
};

// Auth
export type FetchMeResponse = {
  created_at: string;
  updated_at: string;
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  organization: Organization | null;
  exchangeUser: null;
};

export type GetOrgResponse = {
  id: number;
  name: string;
  email: string;
  context: string;
  type: string;
  location: string;
  is_approved: boolean;
  wallet_address: string;
  native_currency: string;
  certificate: string;
  trx_hash: string;
  proposal_onchain_id: number;
  membership_onchain_status: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
};

export type Org = {
  created_at: string;
  updated_at: string;
  id: number;
  name: string;
  type: string;
  location: string;
  membership_onchain_status: string;
};

export type GetAllOrgResponse = {
  data: Org[];
  total: number;
  page: string;
  limit: string;
  totalPages: number;
};
