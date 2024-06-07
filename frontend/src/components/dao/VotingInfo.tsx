import { Badge } from "@components/ui/badge";
import { ArrowRight } from "lucide-react";

export default function VotingInfo() {
    return (
        <>
            <div className="flex flex-col">
                <div className="flex flex-col gap-1">
                    <div className="text-xl font-semibold">Rules Of Decision</div>
                    <div className="flex justify-between">
                        <div className="text-muted-foreground">Options</div>
                        <div>Approve</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="text-muted-foreground">Strategy</div>
                        <div className="flex items-center gap-1">1 Wallet <ArrowRight size={15} /> 1 Vote</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="text-muted-foreground">Minimum approval</div>
                        <div>3 of 4 Addresses</div>
                    </div>
                </div>
            </div>
            <hr className="my-3" />
            <div className="flex flex-col">
                <div className="flex flex-col gap-1">
                    <div className="text-xl font-semibold">Voting activity</div>
                    <div className="flex justify-between">
                        <div className="text-muted-foreground">Current approval</div>
                        <div>2 of 4 Addresses (50%)</div>
                    </div>
                    <div className="flex justify-end">
                        <div className="flex items-center gap-2"><Badge variant="danger">Not Reached</Badge>
                            <span className="text-muted-foreground">1 approval missing</span>
                        </div>
                    </div>
                </div>
            </div>
            <hr className="my-3" />
            <div className="flex flex-col">
                <div className="flex flex-col gap-1">
                    <div className="text-xl font-semibold">Duration</div>
                    <div className="flex justify-between">
                        <div className="text-muted-foreground">Start</div>
                        <div>2024/03/20 08:23 AM UTC+6</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="text-muted-foreground">End</div>
                        <div>Proposal is active until approved or canceled</div>
                    </div>
                </div>
            </div>
        </>
    )
}
