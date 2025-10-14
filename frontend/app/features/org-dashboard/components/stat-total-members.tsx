import { UsersIcon } from 'lucide-react';
import StatCard from '../../../shared/components/dashboard/stat-card';

export default function StatTotalMembers() {
  return (
    <StatCard
      title="Total Members"
      value="7"
      variants="blue"
      icon={UsersIcon}
    />
  );
}
