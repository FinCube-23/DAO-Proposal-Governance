import { RootState } from "@redux/store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Prompt from "./mfs_registration/Prompt";
import StepProgress from "./mfs_registration/StepProgress";
import StepBody from "./mfs_registration/StepBody";
import ClosureStep from "./mfs_registration/ClosureStep";

export default function MFSRegistrationModal() {
    const [showModal, setShowModal] = useState(false);
    const auth = useSelector(
        (state: RootState) => state.persistedReducer.authReducer
    );
    const [current, setCurrent] = useState(0);

    const incrementStep = () => {
        if (current < 4) {
            setCurrent(current + 1);
        }
    };

    const decrementStep = () => {
        if (current > 0) {
            setCurrent(current - 1);
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    useEffect(() => {
        if (auth.profile?.mfsBusiness?.trx_hash == null) {
            setShowModal(true);
        }
    }, [auth.profile?.mfsBusiness?.trx_hash]);

    return (
        <>
            {showModal && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur flex items-center justify-center z-50">
                    <div className="bg-card p-10 rounded-xl shadow-lg border w-[425px] md:w-[600px]">
                        {current === 0 && (
                            <Prompt incrementStep={incrementStep} />
                        )}

                        {current > 0 && current < 4 && (
                            <>
                                <StepProgress current={current} />
                                <StepBody
                                    current={current}
                                    incrementStep={incrementStep}
                                    decrementStep={decrementStep}
                                />
                            </>
                        )}

                        {current === 4 && (
                            <ClosureStep closeModal={closeModal} />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
