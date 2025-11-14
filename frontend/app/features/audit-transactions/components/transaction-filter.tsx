import type { TransactionFilters } from '../types/transaction';
import { Filter, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { cn } from '@/shared/utils';
import { SOURCE_TYPES, STATUS_CONFIG } from '../constants/chains';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export function TransactionFilterCard({
  filters,
  onFiltersChange,
  className,
  isCollapsed = false,
  onToggleCollapsed,
}: TransactionFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);

  const updateFilter = (key: keyof TransactionFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleStatus = (status: string) => {
    const statusNumber = Number.parseInt(status);
    // If clicking the same status, deselect it; otherwise select the new one
    const newStatus = localFilters.status === statusNumber ? undefined : statusNumber;
    updateFilter('status', newStatus);
  };

  const clearFilters = () => {
    const emptyFilters: TransactionFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const activeFilterCount = Object.values(localFilters).filter((value) => {
    if (Array.isArray(value))
      return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  }).length;

  if (isCollapsed) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="outline"
          onClick={onToggleCollapsed}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {localFilters.status !== undefined && (
              <Badge variant="secondary" className="gap-1">
                {Object.entries(STATUS_CONFIG).find(([k]) => Number.parseInt(k) === localFilters.status)?.[1].label ?? localFilters.status}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter('status', undefined)}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 px-2"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
            {onToggleCollapsed && (
              <Button variant="ghost" size="sm" onClick={onToggleCollapsed}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Filter */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Status</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const statusNumber = Number.parseInt(status);
              return (
                <button
                  type="button"
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                    localFilters.status === statusNumber
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted hover:bg-muted/80 border-border',
                  )}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Source Type Filter */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Source Type</Label>
          <Select
            value={localFilters.source || ''}
            onValueChange={value => updateFilter('source', value === 'all-sources' ? undefined : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select source type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-sources">All Sources</SelectItem>
              {SOURCE_TYPES.map(source => (
                <SelectItem key={source} value={source}>
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Address Filter */}
        <div>
          <Label htmlFor="address-filter" className="text-sm font-medium mb-2 block">
            From
          </Label>
          <Input
            id="address-filter"
            placeholder="0x... or ENS name"
            value={localFilters.address || ''}
            onChange={e => updateFilter('address', e.target.value || undefined)}
          />
        </div>

        {/* Address Filter */}
        <div>
          <Label htmlFor="address-filter" className="text-sm font-medium mb-2 block">
            Hash
          </Label>
          <Input
            id="address-filter"
            placeholder="0x... or ENS name"
            value={localFilters.hash || ''}
            onChange={e => updateFilter('hash', e.target.value || undefined)}
          />
        </div>

        {/* Function Name Filter */}
        <div>
          <Label htmlFor="function-filter" className="text-sm font-medium mb-2 block">
            Function Name
          </Label>
          <Input
            id="function-filter"
            placeholder="transfer, approve, swap..."
            value={localFilters.functionName || ''}
            onChange={e => updateFilter('functionName', e.target.value || undefined)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
