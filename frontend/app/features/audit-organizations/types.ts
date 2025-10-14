export type OrgStatus = 'active' | 'suspended' | 'pending';

export interface Organization {
  id: string;
  name: string;
  type: 'PLC' | 'LLC' | 'INC' | 'Other';
  location: string;
  membership_status: OrgStatus;
  created_at: string;
  updated_at: string;
  website?: string;
  contact_email?: string;
  chain_reference?: string;
  treasury_address?: string;
  members_count?: number;
}


