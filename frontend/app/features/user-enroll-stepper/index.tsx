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
  const [isFromOrgCreation, setIsFromOrgCreation] = useState(false);

  // Determine if modal should be shown based on auth state

  const shouldShowModal = useMemo(() => {
    // Keep modal open if we're in the middle of the stepper flow (current > 0)
    if (current > 0) {
      return true;
    }

    if (auth.profile && Array.isArray(auth.profile.organizations)) {
      return auth.profile && auth.profile.organizations?.length < 2;
    }
    return false;
  }, [auth.profile, current]);

  const incrementStep = () => {
    if (current < 4) { // Keep max steps at 4 (0: prompt, 1: wallet, 2: selection, 3: form/dropdown, 4: closure)
      const newStep = current + 1;
      console.warn(`Incrementing step from ${current} to ${newStep}`);
      setCurrent(newStep);
    }
    else {
      console.warn(`Cannot increment step beyond 4, current is ${current}`);
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
    setIsFromOrgCreation(false);
  };

  const handleCreateNewOrg = () => {
    setSelectedFlow('create');
    setIsFromOrgCreation(true);
  };

  const handleSelectExistingOrg = () => {
    setSelectedFlow('select');
  };

  const handleOrganizationSelected = (_orgId: number) => {
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
                {console.warn('Rendering StepperBody, current =', current, 'selectedFlow =', selectedFlow)}
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
              <>
                {console.warn('Rendering StepClosure, current =', current, 'isFromOrgCreation =', isFromOrgCreation)}
                <StepClosure
                  closeModal={closeModal}
                  isFromOrgCreation={isFromOrgCreation}
                />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
