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

// Auth
export interface FetchMeResponse {
  created_at: string;
  updated_at: string;
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  organizations: UserOrgs | null;
  exchangeUser: null;
}

export interface GetOrgResponse {
  id: number;
  name: string;
  email: string;
  type: string;
  address: string;
  legal_entity_identifier: string;
  status?: string; // Legacy field for backward compatibility
  offchain_status: string;
  onchain_status: string;
  is_active: boolean;
  organization_admin: {
    id: number;
    email: string;
    full_name: string;
    status: string;
    phone_number: string;
    wallet_address: string;
  };
  onchain_verifications?: any[];
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

export type OrgUserStatus = 'pending' | 'approved' | 'rejected' | 'banned';

export interface OrgUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  contact_number: string;
  wallet_address: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_verified_email: boolean;
  is_verified_contact_number: boolean;
  status: OrgUserStatus;
  date_joined: string;
  updated_at: string;
}

export interface OrgUserListResponse {
  org_users: OrgUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface OrgOnchainVerificationResponse {
  status: string;
  data: {
    verifications: Array<{
      id: number;
      trx_hash: string;
      onchain_id: number | null;
      onchain_status: string;
      proposer_wallet: string;
      context: {
        __typename: string;
        description: string;
        proposalType: string;
        organizationId: number;
      };
      organization_name: string;
      created_at: string;
      updated_at: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
}
