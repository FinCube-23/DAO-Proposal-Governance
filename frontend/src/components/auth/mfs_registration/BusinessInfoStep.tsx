import BusinessInfoForm from "./BusinessInfoForm";
import { useState } from "react";
import { Button } from "@components/ui/button";

interface Props {
    incrementStep: () => void;
    decrementStep: () => void;
}
export default function BusinessInfoStep({
    incrementStep,
    decrementStep,
}: Props) {
    const [canGoNext, setCanGoNext] = useState(false);

    return (
        <div className="flex flex-col items-start gap-1 my-5">
            <div className="text-xl font-bold">Step 2: Enter Business Info</div>
            <div className="text-center text-muted-foreground">
                Please provide your business information.
            </div>
            <div className="w-full my-5">
                <BusinessInfoForm
                    setCanGoNext={setCanGoNext}
                />
            </div>
            <div className="flex justify-between w-full">
                <Button onClick={decrementStep}>Prev</Button>
                <Button disabled={!canGoNext} onClick={incrementStep}>Next</Button>
            </div>
        </div>
    );
}
