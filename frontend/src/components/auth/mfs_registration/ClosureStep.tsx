import { Button } from "@components/ui/button";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function ClosureStep() {
    const { width, height } = useWindowSize();
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
                    You have completed the registration process for MFS.
                </div>
                <div className="text-center">
                    Your membership proposal has been submitted to the DAO. It
                    might take some time. You can check the status in the dashboard.
                </div>
                <div className="mt-2">
                  <Button>Close</Button>
                </div>
            </div>
        </>
    );
}
