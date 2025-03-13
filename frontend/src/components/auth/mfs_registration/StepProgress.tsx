import { RootState } from "@redux/store";
import { ArrowDown } from "lucide-react";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";

interface Props {
    current: number;
}

export default function StepProgress({ current }: Props) {
    const { isConnected } = useAccount();

    const auth = useSelector(
        (state: RootState) => state.persistedReducer.authReducer
    );

    return (
        <div className="grid grid-cols-11 items-center justify-center gap-3 my-3">
            <div className="col-span-1 relative">
                <div
                    className={`rounded-full text-center border-4 ${
                        isConnected && "border-green-500"
                    }`}
                >
                    1
                </div>
                {current === 1 && (
                    <div className="absolute -top-8 left-2 font-bold animate-bounce">
                        <ArrowDown />
                    </div>
                )}
            </div>
            <div className="col-span-4 h-1 bg-white rounded-xl"></div>
            <div className="col-span-1 relative">
                <div
                    className={`rounded-full text-center border-4 ${
                        auth.profile?.organization != null && "border-green-500"
                    } `}
                >
                    2
                </div>
                {current === 2 && (
                    <div className="absolute -top-8 left-2 font-bold animate-bounce">
                        <ArrowDown />
                    </div>
                )}
            </div>
            <div className="col-span-4 h-1 bg-white rounded-xl"></div>
            <div className="col-span-1 relative">
                <div
                    className={`col-span-1 rounded-full text-center border-4 ${
                        auth.profile?.organization?.trx_hash != null &&
                        "border-white"
                    }`}
                >
                    3
                </div>
                {current === 3 && (
                    <div className="absolute -top-8 left-2 font-bold animate-bounce">
                        <ArrowDown />
                    </div>
                )}
            </div>
        </div>
    );
}
