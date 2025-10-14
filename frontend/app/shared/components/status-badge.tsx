import type { Transaction } from '@/shared/types/transactions';
import { Badge } from '@/shared/components/ui/badge';
import { cn, STATUS_BADGE_CONFIG } from '@/shared/utils';

interface StatusBadgeProps {
  status: Transaction['status'];
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className, showIcon = false }: StatusBadgeProps) {
  const config = STATUS_BADGE_CONFIG[status] || {
    label: 'Unknown',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        config.color,
        status === 'pending' && 'animate-pulse',
        className,
      )}
    >
      {showIcon && (
        <span className={cn(
          'inline-block w-2 h-2 rounded-full mr-1',
          status === 'success' && 'bg-green-600',
          status === 'failed' && 'bg-red-600',
          status === 'reverted' && 'bg-red-600',
          status === 'pending' && 'bg-amber-600',
          status === 'submitted' && 'bg-blue-600',
          status === 'replaced' && 'bg-gray-600',
        )}
        />
      )}
      {config.label}
    </Badge>
  );
}
