import { UsersIcon } from 'lucide-react';
import StatCard from './stat-card';

export default function StatTotalMembers() {
  return (
    <StatCard
      title="Total Members"
      value="7"
      icon={UsersIcon}
    />
  );
}
