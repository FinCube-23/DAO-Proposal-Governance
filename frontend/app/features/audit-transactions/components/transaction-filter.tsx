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
import { CHAIN_INFO, RESOURCE_KINDS, STATUS_CONFIG } from '../constants/chains';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const TIME_RANGES = [
  { label: '15 minutes', value: 15 * 60 * 1000 },
  { label: '1 hour', value: 60 * 60 * 1000 },
  { label: '24 hours', value: 24 * 60 * 60 * 1000 },
  { label: '7 days', value: 7 * 24 * 60 * 60 * 1000 },
  { label: '30 days', value: 30 * 24 * 60 * 60 * 1000 },
];

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

  const toggleArrayFilter = (key: keyof TransactionFilters, value: string) => {
    const currentArray = (localFilters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];

    updateFilter(key, newArray.length > 0 ? newArray : undefined);
  };

  const clearFilters = () => {
    const emptyFilters: TransactionFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const setTimeRange = (minutes: number) => {
    const end = new Date().toISOString();
    const start = new Date(Date.now() - minutes).toISOString();
    updateFilter('time_range', { start, end });
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
            {localFilters.status?.map(status => (
              <Badge key={status} variant="secondary" className="gap-1">
                {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => toggleArrayFilter('status', status)}
                />
              </Badge>
            ))}
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
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <button
                type="button"
                key={status}
                onClick={() => toggleArrayFilter('status', status)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  localFilters.status?.includes(status)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted hover:bg-muted/80 border-border',
                )}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Kind Filter */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Resource Type</Label>
          <Select
            value={localFilters.resource_kind?.[0] || ''}
            onValueChange={value => updateFilter('resource_kind', value === 'all-resource-kinds' ? undefined : [value])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select resource type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-resource-kinds">All Types</SelectItem>
              {RESOURCE_KINDS.map(kind => (
                <SelectItem key={kind} value={kind}>
                  {kind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Address Filter */}
        <div>
          <Label htmlFor="address-filter" className="text-sm font-medium mb-2 block">
            Address
          </Label>
          <Input
            id="address-filter"
            placeholder="0x... or ENS name"
            value={localFilters.participant_address || ''}
            onChange={e => updateFilter('participant_address', e.target.value || undefined)}
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
            value={localFilters.function_name || ''}
            onChange={e => updateFilter('function_name', e.target.value || undefined)}
          />
        </div>

        {/* Value Range */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="min-value" className="text-sm font-medium mb-2 block">
              Min Value
            </Label>
            <Input
              id="min-value"
              placeholder="0.1"
              value={localFilters.min_value || ''}
              onChange={e => updateFilter('min_value', e.target.value || undefined)}
            />
          </div>
          <div>
            <Label htmlFor="max-value" className="text-sm font-medium mb-2 block">
              Max Value
            </Label>
            <Input
              id="max-value"
              placeholder="1000"
              value={localFilters.max_value || ''}
              onChange={e => updateFilter('max_value', e.target.value || undefined)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
