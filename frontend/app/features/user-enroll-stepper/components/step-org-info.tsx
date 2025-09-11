import { CircleChevronLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import OrgInfoForm from './org-info-form';

interface Props {
  incrementStep: () => void;
  decrementStep: () => void;
}

export default function StepOrgInfo({
  incrementStep,
  decrementStep,
}: Props) {
  return (
    <div className="flex flex-col items-start gap-1 my-5">
      <div className="text-xl font-bold">Step 3: Enter Organization Info</div>
      <div className="text-center text-muted-foreground">
        Please provide your organization information.
      </div>
      <div className="w-full my-5">
        <OrgInfoForm
          organization={null}
          onSuccess={incrementStep}
        />
      </div>
      <div className="flex justify-start w-full">
        <Button variant="secondary" onClick={decrementStep}>
          <CircleChevronLeft />
          Prev
        </Button>
      </div>
    </div>
  );
}
