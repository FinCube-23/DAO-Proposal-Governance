export interface CreateOrgPayload {
  name: string;
  email: string;
  type: string;
  address: string;
  legal_entity_identifier: string;
  organization_admin_id: number;
}

export interface CreateOrgResponse {
  status: string;
  data: CreateOrgPayload & {
    id: number;
  };
}

export interface UserOrgs {
  id: number;
  name: string;
  is_admin: boolean;
}

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
  status: boolean;
  organization_admin_id: number;
  organization_admin_name: string;
}

export interface GetOrgResponse {
  id: number;
  email: string;
  name: string;
  type: string;
  is_active: boolean;
  legal_entity_identifier: string;
  onchain_verifications: [];
  organization_admin: {
    id: number;
    full_name: string;
    email: string;
    phone_number: string;
    status: string;
    wallet_address: string;
  };
  status: string;
  address: string;
  created_at: string;
  updated_at: string;
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

export interface AddUserToOrgPayload {
  user_id: number;
  organization_id: number;
}

export interface AddUserToOrgResponse {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  organization_id: number;
  organization_name: string;
  created_at: string;
}

export interface OnchainVerificationPayload {
  trx_hash: string;
  context: {
    org_admin_name: string;
    org_admin_email: string;
    org: {
      name: string;
      type: string;
      address: string;
      legal_entity_identifier: string;
    };
  };
  proposer_wallet: string;
  organization_id: number;
}

export interface OnchainVerificationResponse {
  id: number;
  trx_hash: string;
  context: any;
  proposer_wallet: string;
  organization_id: number;
  created_at: string;
  status: string;
}
