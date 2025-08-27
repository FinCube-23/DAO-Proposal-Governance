import { Building, CircleChevronLeft, CircleChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

interface Props {
  incrementStep: () => void;
  decrementStep: () => void;
  onCreateNew: () => void;
  onSelectExisting: () => void;
}

export default function StepOrgSelection({
  incrementStep,
  decrementStep,
  onCreateNew,
  onSelectExisting,
}: Props) {
  const [selectedOption, setSelectedOption] = useState<'create' | 'select' | null>(null);

  const handleNext = () => {
    if (selectedOption === 'create') {
      onCreateNew();
      incrementStep();
    }
    else if (selectedOption === 'select') {
      onSelectExisting();
      incrementStep();
    }
  };

  const canProceed = selectedOption !== null;

  return (
    <div className="flex flex-col items-start gap-4 my-5">
      <div className="text-xl font-bold">Step 2: Organization Setup</div>
      <div className="text-muted-foreground">
        Choose how you want to set up your organization.
      </div>

      <div className="w-full space-y-4">
        {/* Create New Organization Option */}
        <Card
          className={`cursor-pointer transition-all ${
            selectedOption === 'create' ? 'ring-2 ring-primary' : 'hover:bg-accent'
          }`}
          onClick={() => setSelectedOption('create')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Create New Organization</h3>
                <p className="text-sm text-muted-foreground">
                  Set up a new organization with your business information
                </p>
              </div>
              <div className="flex-shrink-0">
                <input
                  type="radio"
                  checked={selectedOption === 'create'}
                  onChange={() => setSelectedOption('create')}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Select Existing Organization Option */}
        <Card
          className={`cursor-pointer transition-all ${
            selectedOption === 'select' ? 'ring-2 ring-primary' : 'hover:bg-accent'
          }`}
          onClick={() => setSelectedOption('select')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Select Existing Organization</h3>
                <p className="text-sm text-muted-foreground">
                  Join an existing organization that you have access to
                </p>
              </div>
              <div className="flex-shrink-0">
                <input
                  type="radio"
                  checked={selectedOption === 'select'}
                  onChange={() => setSelectedOption('select')}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>
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
