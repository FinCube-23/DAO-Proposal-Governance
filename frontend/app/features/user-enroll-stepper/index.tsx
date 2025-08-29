'use client';

import { useMemo, useState } from 'react';
import useAuthStore from '@/shared/stores/auth';
import Prompt from './components/prompt';
import StepClosure from './components/step-closure';
import StepperBody from './components/stepper-body';
import StepperProgress from './components/stepper-progress';

export default function UserEnrollStepper() {
  const auth = useAuthStore(state => state);
  const [current, setCurrent] = useState(0);
  const [selectedFlow, setSelectedFlow] = useState<'create' | 'select' | null>(null);

  // Determine if modal should be shown based on auth state

  const shouldShowModal = useMemo(() => {
    if (auth.profile && Array.isArray(auth.profile.organizations)) {
      return auth.profile && auth.profile.organizations?.length < 2;
    }
    return false;
  }, [auth.profile]);

  const incrementStep = () => {
    if (current < 5) { // Increased max steps to accommodate new step
      setCurrent(current + 1);
    }
  };

  const decrementStep = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  const closeModal = () => {
    // Reset current step when modal is closed
    setCurrent(0);
    setSelectedFlow(null);
  };

  const handleCreateNewOrg = () => {
    setSelectedFlow('create');
  };

  const handleSelectExistingOrg = () => {
    setSelectedFlow('select');
  };

  const handleOrganizationSelected = (_orgId: number) => {
    // TODO: Implement logic to set the selected organization
    // The _orgId will be used to fetch and set the organization
    // Organization selection is completed, user can proceed to closure
  };

  return (
    <>
      {shouldShowModal && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-card p-10 rounded-xl shadow-lg border w-[425px] md:w-[600px]">
            {current === 0 && (
              <Prompt incrementStep={incrementStep} />
            )}

            {current > 0 && current < 4 && (
              <>
                <StepperProgress current={current} />
                <StepperBody
                  current={current}
                  incrementStep={incrementStep}
                  decrementStep={decrementStep}
                  onCreateNewOrg={handleCreateNewOrg}
                  onSelectExistingOrg={handleSelectExistingOrg}
                  onOrganizationSelected={handleOrganizationSelected}
                  selectedFlow={selectedFlow}
                />
              </>
            )}

            {current === 4 && (
              <StepClosure closeModal={closeModal} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
