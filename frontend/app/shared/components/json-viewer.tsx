import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '../utils';
import { Button } from './ui/button';

interface JsonViewerProps {
  data: any;
  initialCollapsed?: boolean;
  maxLines?: number;
  className?: string;
}

// Helper function to check if a string is a Web3 address
function isWeb3Address(value: string): boolean {
  // Check for Ethereum address (0x followed by 40 hex characters)
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(value);
}

// Helper function to check if a string is a transaction hash
function isTransactionHash(value: string): boolean {
  // Check for transaction hash (0x followed by 64 hex characters)
  const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
  return txHashRegex.test(value);
}

// Helper function to get the color class based on value type
function getValueColor(value: any): string {
  if (value === null)
    return 'text-gray-500';

  if (typeof value === 'string') {
    if (isTransactionHash(value)) {
      return 'text-orange-600 dark:text-orange-400'; // Transaction hashes in orange
    }
    if (isWeb3Address(value)) {
      return 'text-emerald-600 dark:text-emerald-400'; // Web3 addresses in emerald
    }
    return 'text-green-600 dark:text-green-400'; // Regular strings in green
  }

  if (typeof value === 'number')
    return 'text-blue-600 dark:text-blue-400';
  if (typeof value === 'boolean')
    return 'text-purple-600 dark:text-purple-400';
  return 'text-foreground';
}

// Helper function to render JSON with syntax highlighting
function renderJsonValue(value: any, indent: number = 0): React.ReactElement {
  const indentStr = '  '.repeat(indent);

  if (value === null) {
    return <span className={getValueColor(value)}>null</span>;
  }

  if (typeof value === 'string') {
    const colorClass = getValueColor(value);
    let title = '';

    // Add tooltips for special string types
    if (isTransactionHash(value)) {
      title = 'Transaction Hash';
    }
    else if (isWeb3Address(value)) {
      title = 'Web3 Address';
    }

    return (
      <span className={colorClass} title={title}>
        "
        {value}
        "
      </span>
    );
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return <span className={getValueColor(value)}>{String(value)}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-gray-600 dark:text-gray-400">[]</span>;
    }

    return (
      <span>
        <span className="text-gray-600 dark:text-gray-400">[</span>
        {value.map((item, index) => (
          <React.Fragment key={index}>
            <br />
            <span>
              {indentStr}
              {' '}
            </span>
            {renderJsonValue(item, indent + 1)}
            {index < value.length - 1 && <span className="text-gray-600 dark:text-gray-400">,</span>}
          </React.Fragment>
        ))}
        <br />
        <span>{indentStr}</span>
        <span className="text-gray-600 dark:text-gray-400">]</span>
      </span>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return <span className="text-gray-600 dark:text-gray-400">{'{}'}</span>;
    }

    return (
      <span>
        <span className="text-gray-600 dark:text-gray-400">{'{'}</span>
        {entries.map(([key, val], index) => (
          <React.Fragment key={key}>
            <br />
            <span>
              {indentStr}
              {' '}
            </span>
            <span className="text-cyan-600 dark:text-cyan-400">
              "
              {key}
              "
            </span>
            <span className="text-gray-600 dark:text-gray-400">: </span>
            {renderJsonValue(val, indent + 1)}
            {index < entries.length - 1 && <span className="text-gray-600 dark:text-gray-400">,</span>}
          </React.Fragment>
        ))}
        <br />
        <span>{indentStr}</span>
        <span className="text-gray-600 dark:text-gray-400">{'}'}</span>
      </span>
    );
  }

  return <span>{String(value)}</span>;
}

export function JsonViewer({
  data,
  initialCollapsed = false,
  maxLines = 30,
  className,
}: JsonViewerProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const jsonString = JSON.stringify(data, null, 2);
  const lines = jsonString.split('\n');
  const shouldCollapse = lines.length > maxLines;

  // For collapsed view, use plain text
  const collapsedData = shouldCollapse && isCollapsed
    ? `${lines.slice(0, Math.floor(maxLines / 2)).join('\n')}\n  ...\n${
      lines.slice(-Math.floor(maxLines / 2)).join('\n')}`
    : null;

  return (
    <div className={cn('border rounded-lg', className)}>
      {shouldCollapse && (
        <div className="border-b p-2 bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 text-xs"
          >
            {isCollapsed
              ? (
                  <ChevronRight className="h-3 w-3" />
                )
              : (
                  <ChevronDown className="h-3 w-3" />
                )}
            {isCollapsed ? `Show all ${lines.length} lines` : 'Collapse'}
          </Button>
        </div>
      )}
      <pre className="p-4 text-xs font-mono overflow-x-auto bg-muted/10">
        <code className="language-json">
          {isCollapsed && collapsedData
            ? (
                collapsedData
              )
            : (
                renderJsonValue(data)
              )}
        </code>
      </pre>
    </div>
  );
}
