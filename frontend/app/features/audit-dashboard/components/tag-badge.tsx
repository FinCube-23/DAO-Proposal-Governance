import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils/style';

interface TagBadgeProps {
  title?: string;
  tag: string;
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const TAG_COLORS = {
  DEFI: 'bg-purple-500 text-white',
  NFT: 'bg-pink-500 text-white',
  GOVERNANCE: 'bg-blue-500 text-white',
  BRIDGE: 'bg-orange-500 text-white',
  TOKEN: 'bg-green-500 text-white',
  TRANSFER: 'bg-green-500 text-white',
  DEFAULT: 'bg-gray-500 text-white',
} as const;

export function TagBadge({
  title,
  tag,
  className,
  variant = 'secondary',
}: TagBadgeProps) {
  const colorClass = TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.DEFAULT;

  return (
    <Badge
      variant={variant}
      className={cn(
        variant === 'secondary' && colorClass,
        'text-xs',
        className,
      )}
    >
      {title}
    </Badge>
  );
}
