import { Button } from "@components/ui/button";
import {
    readContract,
    simulateContract,
    waitForTransactionReceipt,
    writeContract,
} from "@wagmi/core";
import { FormEvent, useState } from "react";
import contractABI from "../../../contractABI/contractABI.json";
import { config } from "@layouts/RootLayout";
import { useAccount } from "wagmi";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { toast } from "sonner";
import { useUpdateMFSMutation } from "@redux/services/mfs";

interface Props {
    incrementStep: () => void;
    decrementStep: () => void;
}

export default function RegisterAsMemberStep({
    incrementStep,
    decrementStep,
}: Props) {
    const account = useAccount();
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);
    const auth = useSelector(
        (state: RootState) => state.persistedReducer.authReducer
    );

    const [
        updateMFS,
        {
            data: updateMFSData,
            isLoading: isUpdateMFSLoading,
            isSuccess: isUpdateMFSSuccess,
            isError: isUpdateMFSError,
        },
    ] = useUpdateMFSMutation();

    const register = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsRegisterLoading(true);
        try {
            const { request } = await simulateContract(config, {
                abi: contractABI,
                address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
                functionName: "registerMember",
                args: [
                    account.address,
                    JSON.stringify({
                        "@context": auth.profile?.mfsBusiness?.context,
                        name: auth.profile?.mfsBusiness?.name,
                        type: auth.profile?.mfsBusiness?.type,
                        location: auth.profile?.mfsBusiness?.location,
                        members: [],
                    }),
                ],
            });

            const hash = await writeContract(config, request);

            updateMFS({ id: auth.profile?.mfsBusiness?.id || 0, trx_hash: hash });
        } catch (e: any) {
            let errorMessage = e.message;

            if (errorMessage.includes("reverted with the following reason:")) {
                const match = errorMessage.match(
                    /reverted with the following reason:\s*(.*)/
                );
                if (match) {
                    errorMessage = match[1];
                }
            }
            toast.error(errorMessage);
        } finally {
            setIsRegisterLoading(false);
        }
    };

    if (isUpdateMFSSuccess) {
        incrementStep();
    }

    if (isUpdateMFSError) {
        toast.error("Something went wrong");
    }

    return (
        <div className="flex flex-col items-start gap-1 my-5">
            <div className="text-xl font-bold">Step 3: Become a Member</div>
            <div className="text-center text-muted-foreground">
                Apply for membership on chain.
            </div>
            <div className="w-full my-5"></div>
            <div className="flex justify-between w-full">
                <Button onClick={decrementStep}>Prev</Button>
            </div>
        </div>
    );
}
