import type { Route } from './+types/organization.superadmin.users';
import SuperAdminUsers from '@/features/superadmin-users';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Users - SuperAdmin Panel - Web3 Governance Kit' },
    { name: 'description', content: 'Manage all users' },
  ];
}

export default function SuperAdminUsersRoute() {
  return <SuperAdminUsers />;
}
