import { Button } from "@components/ui/button";
import { CircleChevronRight } from "lucide-react";

interface Props {
    incrementStep: () => void;
}

export default function Prompt({ incrementStep }: Props) {
    return (
        <div className="flex flex-col items-center gap-3 my-5">
            <div className="text-xl font-bold text-center">
                Oops No MFS Profile Found
            </div>
            <div className="text-center">Please Register Your MFS Profile</div>
            <div className="mt-2">
                <Button onClick={incrementStep}>
                    Proceed <CircleChevronRight />
                </Button>
            </div>
        </div>
    );
}
