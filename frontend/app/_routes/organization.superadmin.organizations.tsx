import type { Route } from './+types/organization.superadmin.organizations';
import SuperAdminOrganizations from '@/features/superadmin-organizations';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Organizations - SuperAdmin Panel - Web3 Governance Kit' },
    { name: 'description', content: 'Manage all organizations' },
  ];
}

export default function SuperAdminOrganizationsRoute() {
  return <SuperAdminOrganizations />;
}
