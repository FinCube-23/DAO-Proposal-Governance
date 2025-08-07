import BusinessInfoStep from "./BusinessInfoStep";
import RegisterAsMemberStep from "./RegisterAsMemberStep";
import StepWalletConnect from "./step-wallet-connet";

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
                <BusinessInfoStep
                    incrementStep={incrementStep}
                    decrementStep={decrementStep}
                />
            )}
            {current === 3 && (
                <RegisterAsMemberStep
                    incrementStep={incrementStep}
                    decrementStep={decrementStep}
                />
            )}
        </>
    );
}
