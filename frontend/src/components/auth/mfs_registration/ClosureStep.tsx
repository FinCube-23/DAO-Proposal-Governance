import { Button } from "@components/ui/button";
import { RootState } from "@redux/store";
import { CircleChevronDown } from "lucide-react";
import Confetti from "react-confetti";
import { useSelector } from "react-redux";
import { useWindowSize } from "react-use";

interface Props {
    closeModal: () => void;
}

export default function ClosureStep({ closeModal }: Props) {
    const { width, height } = useWindowSize();
    const auth = useSelector(
        (state: RootState) => state.persistedReducer.authReducer
    );
    return (
        <>
            <Confetti
                run={true}
                recycle={false}
                width={width}
                height={height}
            />
            <div className="flex flex-col items-center gap-3 my-5">
                <div className="text-xl font-bold text-center">
                    {auth.profile?.mfsBusiness?.trx_hash === "0x00"
                        ? "Application Already Submitted"
                        : "Application Submitted"}
                </div>
                <div className="text-center">
                    {auth.profile?.mfsBusiness?.trx_hash === "0x00"
                        ? "You’ve already applied to join our DAO. Your application is currently under review and will be voted on by the members. Feel free to explore the portal in the meantime"
                        : "Thank you for applying to join our DAO! Your application is now pending review and will be voted on by the current members. You can explore the portal while you wait for the results."}
                </div>
                <div className="mt-2">
                    <Button onClick={closeModal}>
                        Explore Portal <CircleChevronDown />
                    </Button>
                </div>
            </div>
        </>
    );
}
