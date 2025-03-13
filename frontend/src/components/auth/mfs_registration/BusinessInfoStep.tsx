import BusinessInfoForm from "./BusinessInfoForm";
import { Button } from "@components/ui/button";
import { RootState } from "@redux/store";
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";
import { useSelector } from "react-redux";

interface Props {
    incrementStep: () => void;
    decrementStep: () => void;
}

export default function BusinessInfoStep({
    incrementStep,
    decrementStep,
}: Props) {
    const auth = useSelector(
        (state: RootState) => state.persistedReducer.authReducer
    );
    return (
        <div className="flex flex-col items-start gap-1 my-5">
            <div className="text-xl font-bold">Step 2: Enter Business Info</div>
            <div className="text-center text-muted-foreground">
                Please provide your business information.
            </div>
            <div className="w-full my-5">
                <BusinessInfoForm
                    mfsBusiness={auth.profile?.organization ?? null}
                />
            </div>
            <div className="flex justify-between w-full">
                <Button variant={"secondary"} onClick={decrementStep}>
                    <CircleChevronLeft /> Prev
                </Button>
                {auth.profile?.organization != null && (
                    <Button
                        disabled={auth.profile?.organization == null}
                        onClick={incrementStep}
                    >
                        Next <CircleChevronRight />
                    </Button>
                )}
            </div>
        </div>
    );
}
