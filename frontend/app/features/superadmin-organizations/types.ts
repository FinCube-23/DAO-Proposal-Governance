export type SuperAdminOrgStatus = 'pending' | 'approved' | 'cancelled' | 'banned';

export type SuperAdminOrgType = 'plc' | 'llc' | 'inc' | 'other';

export type DateFilterOption = 'any' | 'today' | 'past_7_days' | 'this_month' | 'this_year';

export interface SuperAdminOrganization {
  id: number;
  name: string;
  organization_admin_id: number;
  organization_admin_name: string;
  email: string;
  type: SuperAdminOrgType;
  status: SuperAdminOrgStatus;
  address: string;
  legal_entity_identifier: string;
  created_at: string;
  updated_at: string;
}

export interface SuperAdminOrgFilters {
  status: 'all' | SuperAdminOrgStatus;
  type: 'all' | SuperAdminOrgType;
  is_active: 'all' | 'yes' | 'no';
  created_at: DateFilterOption;
  search: string;
  sort_by: 'created_at' | 'email' | 'id' | 'is_active' | 'name' | 'status' | 'type';
  order: 'asc' | 'desc';
}

export interface SuperAdminOrgResponse {
  organizations: SuperAdminOrganization[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
