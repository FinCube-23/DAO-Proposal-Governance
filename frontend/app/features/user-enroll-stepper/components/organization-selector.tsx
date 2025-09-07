import type { Org } from '@/core/services/org/types';
import { useQuery } from '@tanstack/react-query';
import { Building } from 'lucide-react';
import { orgApis } from '@/core/services/org';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

interface Props {
  onSelect: (orgId: number) => void;
  value?: string;
  disabled?: boolean;
}

export default function OrganizationSelector({ onSelect, value, disabled }: Props) {
  // Fetch organizations from API
  const {
    data: orgResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['organizations', 'approved'],
    queryFn: () => orgApis.getAllOrgs({ status: 'approved' }),
  });

  const organizations: Org[] = orgResponse?.organizations || [];

  const handleValueChange = (selectedValue: string) => {
    // Prevent selection of disabled items
    if (!['loading', 'error', 'no-orgs'].includes(selectedValue)) {
      onSelect(Number.parseInt(selectedValue, 10));
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-3 mb-4">
        <Building className="h-6 w-6 text-primary" />
        <div>
          <h3 className="font-semibold">Available Organizations</h3>
          <p className="text-sm text-muted-foreground">
            Select from organizations you have access to
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Organization</label>
        <Select
          value={value}
          onValueChange={handleValueChange}
          disabled={isLoading || disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                isLoading
                  ? 'Loading organizations...'
                  : error
                    ? 'Error loading organizations'
                    : 'Choose an organization...'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {isLoading
              ? (
                  <SelectItem value="loading" disabled>
                    Loading organizations...
                  </SelectItem>
                )
              : error
                ? (
                    <SelectItem value="error" disabled>
                      Error loading organizations
                    </SelectItem>
                  )
                : organizations.length === 0
                  ? (
                      <SelectItem value="no-orgs" disabled>
                        No organizations available
                      </SelectItem>
                    )
                  : (
                      organizations.map(org => (
                        <SelectItem key={org.id} value={org.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{org.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {org.type}
                              {' '}
                              •
                              {org.address}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
          </SelectContent>
        </Select>
      </div>

      {value && !['loading', 'error', 'no-orgs'].includes(value) && (
        <div className="mt-4 p-4 border rounded-lg bg-accent/50">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Selected Organization:</span>
          </div>
          <div className="mt-2">
            {(() => {
              const org = organizations.find(o => o.id.toString() === value);
              return org
                ? (
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {org.type && org.address
                          ? `${org.type} • ${org.address}`
                          : org.type || org.address || 'Organization'}
                      </p>
                    </div>
                  )
                : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
