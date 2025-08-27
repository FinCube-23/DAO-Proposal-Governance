import type { Org } from '@/core/services/org/types';
import { useQuery } from '@tanstack/react-query';
import { Building, CircleChevronLeft, CircleChevronRight } from 'lucide-react';
import { useState } from 'react';
import { orgApis } from '@/core/services/org';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

interface Organization {
  id: number;
  name: string;
  email?: string;
  type?: string;
  location?: string;
}

interface Props {
  incrementStep: () => void;
  decrementStep: () => void;
  onSelectOrganization: (orgId: number) => void;
}

export default function StepOrgDropdown({
  incrementStep,
  decrementStep,
  onSelectOrganization,
}: Props) {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  // Fetch organizations from API
  const { data: orgResponse, isLoading, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => orgApis.getAllOrgs({}),
  });

  const organizations: Organization[] = orgResponse?.data.map((org: Org) => ({
    id: org.id,
    name: org.name,
    type: org.type,
    location: org.location,
  })) || [];

  const handleValueChange = (value: string) => {
    // Prevent selection of disabled items
    if (!['loading', 'error', 'no-orgs'].includes(value)) {
      setSelectedOrgId(value);
    }
  };

  const handleNext = () => {
    if (selectedOrgId && !['loading', 'error', 'no-orgs'].includes(selectedOrgId)) {
      onSelectOrganization(Number.parseInt(selectedOrgId, 10));
      incrementStep();
    }
  };

  const canProceed = selectedOrgId !== '' && !isLoading && !['loading', 'error', 'no-orgs'].includes(selectedOrgId);

  return (
    <div className="flex flex-col items-start gap-4 my-5">
      <div className="text-xl font-bold">Step 3: Select Organization</div>
      <div className="text-muted-foreground">
        Choose an organization to join from the list below.
      </div>

      <div className="w-full space-y-4">
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
          <label className="block text-sm font-medium">
            Organization
          </label>
          <Select value={selectedOrgId} onValueChange={handleValueChange} disabled={isLoading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={
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
                              <span className="text-sm text-muted-foreground">
                                {org.type && org.location ? `${org.type} • ${org.location}` : org.type || org.location || 'Organization'}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
            </SelectContent>
          </Select>
        </div>

        {selectedOrgId && !['loading', 'error', 'no-orgs'].includes(selectedOrgId) && (
          <div className="mt-4 p-4 border rounded-lg bg-accent/50">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Selected Organization:</span>
            </div>
            <div className="mt-2">
              {(() => {
                const org = organizations.find(o => o.id.toString() === selectedOrgId);
                return org
                  ? (
                      <div>
                        <p className="font-medium">{org.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {org.type && org.location ? `${org.type} • ${org.location}` : org.type || org.location || 'Organization'}
                        </p>
                      </div>
                    )
                  : null;
              })()}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between w-full mt-6">
        <Button variant="secondary" onClick={decrementStep}>
          <CircleChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed}
        >
          Next
          <CircleChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
