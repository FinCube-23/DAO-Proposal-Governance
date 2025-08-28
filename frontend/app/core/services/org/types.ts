export interface CreateOrgPayload {
  name: string;
  email: string;
  type: string;
  address: string;
  legal_entity_identifier: string;
  wallet_address: string;
}

export type CreateOrgResponse = CreateOrgPayload & {
  id: number;
  is_approved: boolean;
  trx_hash: string | null;
  membership_onchain_status: string;
};

export interface UpdateOrgPayload {
  id: number;
  name?: string;
  email?: string;
  type?: string;
  address?: string;
  legal_entity_identifier?: string;
  wallet_address?: string;
  organization_admin_id?: number;
  trx_hash?: string;
}

export type UpdateOrgResponse = UpdateOrgPayload;

export interface Organization {
  id: number;
  name: string;
  email: string;
  type: string;
  address: string;
  legal_entity_identifier: string;
  is_approved: boolean;
  wallet_address: string;
  organization_admin_id: number;
  trx_hash: string | null;
  membership_onchain_status: string;
}

// Auth
export interface FetchMeResponse {
  created_at: string;
  updated_at: string;
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  organization: Organization | null;
  exchangeUser: null;
}

export interface GetOrgResponse {
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
}

export interface Org {
  id: number;
  name: string;
  email: string;
  type: string;
  address: string;
  legal_entity_identifier: string;
  status: string;
  organization_admin_id: number;
  organization_admin_name: string;
}

export interface OrganizationOption {
  id: number;
  name: string;
  email?: string;
  type?: string;
  location?: string;
}

export interface GetAllOrgResponse {
  organizations: Org[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
