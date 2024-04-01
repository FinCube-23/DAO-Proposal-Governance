interface Props {
    total: number;
    yes: number;
    no: number;
}
export default function VotingProgressBar({ total, yes, no }: Props) {
    const neutral = total - (yes + no);
    const yesPercent = (yes / total) * 100;
    const noPercent = (no / total) * 100;
    const neutralPercent = (neutral / total) * 100;
    return (
        <div className="border h-4 my-2 text-xs flex rounded-lg bg-emerald-200">
            <div
                style={{ width: `${yesPercent}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap rounded-l-lg text-white justify-center bg-green-400"
            >Yes</div>
            <div
                style={{ width: `${noPercent}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-400"
            >No</div>
            <div
                style={{ width: `${neutralPercent}%` }}
                className="shadow-none flex flex-col text-center rounded-r-lg whitespace-nowrap text-white justify-center bg-gray-300"
            >None</div>
        </div>
    );
}
