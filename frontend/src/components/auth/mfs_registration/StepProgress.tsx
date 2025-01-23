import { RootState } from "@redux/store";
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
            <div
                className={`col-span-1 rounded-full text-center border-4 ${
                    isConnected && "border-green-500"
                }`}
            >
                1
            </div>
            <div className="col-span-4 h-1 bg-white rounded-xl"></div>
            <div
                className={`col-span-1 rounded-full text-center border-4 ${
                    auth.profile?.mfsBusiness != null && "border-green-500"
                } `}
            >
                2
            </div>
            <div className="col-span-4 h-1 bg-white rounded-xl"></div>
            <div
                className={`col-span-1 rounded-full text-center border-4 ${
                    auth.profile?.mfsBusiness?.trx_hash != null && "border-white"
                }`}
            >
                3
            </div>
        </div>
    );
}
