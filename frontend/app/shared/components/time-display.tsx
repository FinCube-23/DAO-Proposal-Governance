import { useEffect, useState } from 'react';
import { cn } from '@/shared/utils';
import { formatTimestamp, relativeTime } from '@/shared/utils/formatters';

interface TimeDisplayProps {
  timestamp: string;
  className?: string;
  showRelative?: boolean;
  enableToggle?: boolean;
}

export function TimeDisplay({
  timestamp,
  className,
  showRelative = true,
  enableToggle = false,
}: TimeDisplayProps) {
  const [isRelative, setIsRelative] = useState(showRelative);
  const [_, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    if (!isRelative)
      return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isRelative]);

  const handleClick = () => {
    if (enableToggle) {
      setIsRelative(!isRelative);
    }
  };

  const displayValue = isRelative
    ? relativeTime(timestamp)
    : formatTimestamp(timestamp);

  return (
    <span
      className={cn(
        'text-sm',
        enableToggle && 'cursor-pointer hover:underline',
        className,
      )}
      onClick={handleClick}
      title={isRelative ? formatTimestamp(timestamp) : relativeTime(timestamp)}
    >
      {displayValue}
    </span>
  );
}
