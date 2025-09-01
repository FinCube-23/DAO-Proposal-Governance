import StepOrgDropdown from './step-org-dropdown';
import StepOrgInfo from './step-org-info';
import StepOrgSelection from './step-org-selection';
import StepWalletConnect from './step-wallet-connect';

interface Props {
  current: number;
  incrementStep: () => void;
  decrementStep: () => void;
  onCreateNewOrg: () => void;
  onSelectExistingOrg: () => void;
  onOrganizationSelected: (orgId: number) => void;
  selectedFlow?: 'create' | 'select' | null;
}

export default function StepperBody({
  current,
  incrementStep,
  decrementStep,
  onCreateNewOrg,
  onSelectExistingOrg,
  onOrganizationSelected,
  selectedFlow,
}: Props) {
  return (
    <>
      {/* Step 1: Wallet Connect */}
      {current === 1 && (
        <StepWalletConnect
          incrementStep={incrementStep}
        />
      )}
      
      {/* Step 2: Choose between creating new org or joining existing */}
      {current === 2 && (
        <StepOrgSelection
          incrementStep={incrementStep}
          decrementStep={decrementStep}
          onCreateNew={onCreateNewOrg}
          onSelectExisting={onSelectExistingOrg}
        />
      )}
      
      {/* Step 3: Show form if creating, dropdown if joining */}
      {current === 3 && selectedFlow === 'create' && (
        <StepOrgInfo
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      )}
      
      {current === 3 && selectedFlow === 'select' && (
        <StepOrgDropdown
          incrementStep={incrementStep}
          decrementStep={decrementStep}
          onSelectOrganization={onOrganizationSelected}
        />
      )}
    </>
  );
}
