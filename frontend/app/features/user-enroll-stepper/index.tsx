'use client';

import useAuthStore from "@/shared/stores/auth";
import { useEffect, useState } from "react";
import Prompt from "./components/prompt";
import StepperProgress from "./components/stepper-progress";
import StepperBody from "./components/stepper-body";
import StepClosure from "./components/step-closure";

export default function UserEnrollStepper() {
    const [showModal, setShowModal] = useState(false);
    const auth = useAuthStore((state) => state);
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
        if (auth.profile?.organization?.trx_hash == null) {
            setShowModal(false);
        }
    }, [auth.profile?.organization?.trx_hash]);

    return (
        <>
            {showModal && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur flex items-center justify-center z-50">
                    <div className="bg-card p-10 rounded-xl shadow-lg border w-[425px] md:w-[600px]">
                        {current === 0 && (
                            <Prompt incrementStep={incrementStep} />
                        )}

                        {current > 0 && current < 3 && (
                            <>
                                <StepperProgress current={current} />
                                <StepperBody
                                    current={current}
                                    incrementStep={incrementStep}
                                    decrementStep={decrementStep}
                                />
                            </>
                        )}

                        {current === 3 && (
                            <StepClosure closeModal={closeModal} />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
