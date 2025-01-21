import { Button } from "@components/ui/button";
import { CircleChevronRight } from "lucide-react";

interface Props {
    handleNext: () => void;
}

export default function Prompt({ handleNext }: Props) {
    return (
        <div className="flex flex-col items-center gap-3 my-5">
            <div className="text-xl font-bold text-center">Oops No MFS Profile Found</div>
            <div className="text-center">Please Register Your MFS Profile</div>
            <div className="mt-2">
                <Button onClick={handleNext}>
                    Proceed <CircleChevronRight />
                </Button>
            </div>
        </div>
    );
}
