import StepOrgInfo from './step-org-info';
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
  onCreateNewOrg: _onCreateNewOrg,
  onSelectExistingOrg: _onSelectExistingOrg,
  onOrganizationSelected: _onOrganizationSelected,
  selectedFlow: _selectedFlow,
}: Props) {
  return (
    <>
      {current === 1 && (
        <StepWalletConnect
          incrementStep={incrementStep}
        />
      )}
      {current === 2 && (
        <StepOrgInfo
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      )}
    </>
  );
}
