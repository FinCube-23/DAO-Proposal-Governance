import type { Route } from './+types/organization.superadmin.dashboard';
import SuperAdminDashboard from '@/features/superadmin-dashboard';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'SuperAdmin Dashboard - Web3 Governance Kit' },
    { name: 'description', content: 'SuperAdmin Dashboard' },
  ];
}

export default function SuperAdminDashboardRoute() {
  return <SuperAdminDashboard />;
}
