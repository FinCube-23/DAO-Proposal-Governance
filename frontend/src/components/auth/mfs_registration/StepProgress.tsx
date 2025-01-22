import { useAccount } from "wagmi";

interface Props {
    current: number;
}

export default function StepProgress({ current }: Props) {
    const { isConnected } = useAccount();

    return (
        <div className="grid grid-cols-11 items-center justify-center gap-3 my-3">
            <div
                className={`col-span-1 rounded-full text-center border-2 ${
                    isConnected && "border-green-500"
                }`}
            >
                1
            </div>
            <div className="col-span-4 h-1 bg-white rounded-xl"></div>
            <div
                className={`col-span-1 rounded-full text-center border-2 ${
                    current === 2 && "border-white"
                } ${current > 2 && "border-green-500"}`}
            >
                2
            </div>
            <div className="col-span-4 h-1 bg-white rounded-xl"></div>
            <div
                className={`col-span-1 rounded-full text-center border-2 ${
                    current === 3 && "border-white"
                } ${current > 3 && "border-green-500"}`}
            >
                3
            </div>
        </div>
    );
}
