import VotingProgressBar from "./VotingProgressBar";
import { Button } from "@components/ui/button";

export default function VotingBreakdown() {
    return (
        <div>
            <div className="flex justify-between">
                <div className="text-primary font-bold">Approved By</div>
                <div>
                    <span className="text-primary font-bold">2</span> of 4
                    Members
                </div>
            </div>
            <VotingProgressBar total={4} yes={2} no={1} />
            <div className="flex justify-end">
                <Button className=" mt-2 bg-green-400 font-bold w-32">
                    Vote
                </Button>
            </div>
        </div>
    );
}
