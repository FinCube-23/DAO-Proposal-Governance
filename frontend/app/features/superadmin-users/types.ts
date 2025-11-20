export type SuperAdminUserStatus = 'pending' | 'approved' | 'rejected' | 'banned';

export interface SuperAdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  wallet_address: string | null;
  status: SuperAdminUserStatus;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_verified_email: boolean;
  is_verified_contact_number: boolean;
  date_joined: string;
  updated_at: string;
}

export interface SuperAdminUserFilters {
  status: 'all' | SuperAdminUserStatus;
  is_active: 'all' | 'yes' | 'no';
  is_verified_email: 'all' | 'yes' | 'no';
  is_verified_contact_number: 'all' | 'yes' | 'no';
  search: string;
  sort_by: 'date_joined' | 'email' | 'first_name' | 'id' | 'is_active' | 'is_staff' | 'is_superuser' | 'is_verified_contact_number' | 'is_verified_email' | 'last_name' | 'status' | 'updated_at';
  order: 'asc' | 'desc';
}

export interface SuperAdminUserListResponse {
  users: SuperAdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface SuperAdminUserResponse {
  users: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    banned: number;
    active: number;
  };
  organizations: {
    total: number;
    pending: number;
    approved: number;
    cancelled: number;
    banned: number;
    active: number;
  };
  onchain_verifications: {
    total: number;
    register: number;
    pending: number;
    approved: number;
    cancelled: number;
  };
}
