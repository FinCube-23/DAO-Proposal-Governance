import StepOrgInfo from "./step-org-info";
import StepWalletConnect from "./step-wallet-connect";

interface Props {
    current: number;
    incrementStep: () => void;
    decrementStep: () => void;
}

export default function StepperBody({
    current,
    incrementStep,
    decrementStep,
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
