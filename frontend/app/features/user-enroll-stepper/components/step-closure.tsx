import { Button } from "@/shared/components/ui/button";
import useAuthStore from "@/shared/stores/auth";
import { CircleChevronDown } from "lucide-react";

interface Props {
    closeModal: () => void;
}

export default function StepClosure({ closeModal }: Props) {
    const authStore = useAuthStore((state) => state);

    return (
        <>
            <div className="flex flex-col items-center gap-3 my-5">
                <div className="text-xl font-bold text-center">
                    {authStore.profile?.organization?.trx_hash === "0x00"
                        ? "Application Already Submitted"
                        : "Application Submitted"}
                </div>
                <div className="text-center">
                    {authStore.profile?.organization?.trx_hash === "0x00"
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
