import { RootState } from "@redux/store";
import { useSelector } from "react-redux";
import { useState } from "react";
import Prompt from "./mfs_registration/Prompt";
import StepProgress from "./mfs_registration/StepProgress";
import StepBody from "./mfs_registration/StepBody";

export default function MFSRegistrationModal() {
    const auth = useSelector(
        (state: RootState) => state.persistedReducer.authReducer
    );
    const [current, setCurrent] = useState(0);

    const incrementStep = () => {
        if (current < 3) {
            setCurrent(current + 1);
        }
    };

    const decrementStep = () => {  
        if (current > 0) {
            setCurrent(current - 1);
        }
    };

    return (
        <>
            {!auth.profile?.mfsBusiness && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur flex items-center justify-center z-50">
                    <div className="bg-card p-10 rounded-xl shadow-lg border w-[425px] md:w-[600px]">
                        {current === 0 && <Prompt incrementStep={incrementStep} />}

                        {current > 0 && (
                            <>
                                <StepProgress current={current} />
                                <StepBody current={current} incrementStep={incrementStep} decrementStep={decrementStep} />
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
