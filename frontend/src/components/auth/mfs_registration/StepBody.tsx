import ConnectWalletStep from "./ConnectWalletStep";
import BusinessInfoStep from "./BusinessInfoStep";
import RegisterAsMemberStep from "./RegisterAsMemberStep";
interface Props {
    current: number;
    incrementStep: () => void;
    decrementStep: () => void;
}

export default function StepBody({
    current,
    incrementStep,
    decrementStep,
}: Props) {
    return (
        <>
            {current === 1 && (
                <ConnectWalletStep
                    current={current}
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
