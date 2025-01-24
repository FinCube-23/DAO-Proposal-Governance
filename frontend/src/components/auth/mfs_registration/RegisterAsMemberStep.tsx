import { Button } from "@components/ui/button";
import { simulateContract, writeContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import contractABI from "../../../contractABI/contractABI.json";
import { config } from "@layouts/RootLayout";
import { useAccount } from "wagmi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { toast } from "sonner";
import { useUpdateMFSMutation } from "@redux/services/mfs";
import { setMfsBusinessTrxHash } from "@redux/slices/auth";
import { CircleChevronLeft, CircleChevronUp } from "lucide-react";

interface Props {
    incrementStep: () => void;
    decrementStep: () => void;
}

export default function RegisterAsMemberStep({
    incrementStep,
    decrementStep,
}: Props) {
    const dispatch = useDispatch();
    const account = useAccount();
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);
    const auth = useSelector(
        (state: RootState) => state.persistedReducer.authReducer
    );

    const [
        updateMFS,
        {
            data: updateMFSData,
            isSuccess: isUpdateMFSSuccess,
            isError: isUpdateMFSError,
        },
    ] = useUpdateMFSMutation();

    const register = async () => {
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

            updateMFS({
                id: auth.profile?.mfsBusiness?.id || 0,
                trx_hash: hash,
            });
        } catch (err: any) {
            let errorMessage = err.message;

            if (errorMessage.includes("reverted with the following reason:")) {
                const match = errorMessage.match(
                    /reverted with the following reason:\s*(.*)/
                );
                if (match) {
                    errorMessage = match[1];
                }
            }

            if (errorMessage == "Already a member") {
                updateMFS({
                    id: auth.profile?.mfsBusiness?.id || 0,
                    trx_hash: "0x00",
                });
            }else{
                setIsRegisterLoading(false);
            }
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        if (isUpdateMFSSuccess) {
            setIsRegisterLoading(false);
            dispatch(setMfsBusinessTrxHash(updateMFSData?.trx_hash || ""));
            incrementStep();
        }
    }, [isUpdateMFSSuccess]);

    useEffect(() => {
        if (isUpdateMFSError) {
            setIsRegisterLoading(false);
            toast.error("Something went wrong");
        }
    }, [isUpdateMFSError]);

    return (
        <div className="flex flex-col items-start gap-1 my-5">
            <div className="text-xl font-bold">
                Step 3: Apply for Membership
            </div>
            <div className="text-muted-foreground">
                Submit your application to join our DAO. Current members will
                vote to approve your membership.
            </div>
            <div className="w-full my-5 flex justify-end">
                <Button onClick={register} isLoading={isRegisterLoading}>
                    Apply for Membership <CircleChevronUp />
                </Button>
            </div>
            <div className="flex justify-between w-full">
                <Button variant="secondary" onClick={decrementStep}>
                    <CircleChevronLeft /> Prev
                </Button>
            </div>
        </div>
    );
}
