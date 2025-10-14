import { Check, Copy } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/style';

interface CopyableCodeProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
  displayValue?: string;
  showCopyButton?: boolean;
}

export function CopyableCode({
  value,
  children,
  className,
  displayValue,
  showCopyButton = true,
}: CopyableCodeProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
    catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={cn('flex items-center gap-2 group', className)}>
      <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
        {displayValue || children || value}
      </code>
      {showCopyButton && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopy}
        >
          {isCopied
            ? (
                <Check className="h-3 w-3 text-green-600" />
              )
            : (
                <Copy className="h-3 w-3" />
              )}
        </Button>
      )}
    </div>
  );
}
