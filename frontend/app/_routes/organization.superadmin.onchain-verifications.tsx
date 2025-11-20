import type { Route } from './+types/organization.superadmin.onchain-verifications';
import SuperAdminOnchainVerifications from '@/features/superadmin-onchain-verifications';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Onchain Verifications - SuperAdmin Panel - Web3 Governance Kit' },
    { name: 'description', content: 'Manage all onchain verifications' },
  ];
}

export default function SuperAdminOnchainVerificationsRoute() {
  return <SuperAdminOnchainVerifications />;
}
