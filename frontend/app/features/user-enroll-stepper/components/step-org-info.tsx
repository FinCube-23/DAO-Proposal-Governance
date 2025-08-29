import { CircleChevronLeft, CircleChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import useAuthStore from '@/shared/stores/auth';
import OrgInfoForm from './org-info-form';

interface Props {
  incrementStep: () => void;
  decrementStep: () => void;
}

export default function StepOrgInfo({
  incrementStep,
  decrementStep,
}: Props) {
  const authStore = useAuthStore(state => state);

  return (
    <div className="flex flex-col items-start gap-1 my-5">
      <div className="text-xl font-bold">Step 3: Enter Organization Info</div>
      <div className="text-center text-muted-foreground">
        Please provide your organization information.
      </div>
      <div className="w-full my-5">
        <OrgInfoForm
          organization={null}
        />
      </div>
      <div className="flex justify-between w-full">
        <Button variant="secondary" onClick={decrementStep}>
          <CircleChevronLeft />
          {' '}
          Prev
        </Button>
        {authStore.profile?.organizations && authStore.profile.organizations.length > 0 && (
          <Button
            disabled={!authStore.profile?.organizations || authStore.profile.organizations.length === 0}
            onClick={incrementStep}
          >
            Next
            <CircleChevronRight />
          </Button>
        )}
      </div>
    </div>
  );
}
