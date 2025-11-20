import type { Route } from './+types/organization.superadmin._index';
import { Navigate } from 'react-router';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'SuperAdmin - Web3 Governance Kit' },
    { name: 'description', content: 'SuperAdmin Panel' },
  ];
}

export default function SuperAdminIndexRoute() {
  return <Navigate to="/organization/superadmin/dashboard" replace />;
}
