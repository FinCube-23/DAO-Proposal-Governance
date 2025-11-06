interface Props {
  label: string;
  gradient: string;
  value: string | number;
}

export default function GovernanceItem({ label, gradient, value }: Props) {
  return (
    <div
      className="p-3 sm:p-4 bg-slate-900 rounded-lg hover:bg-slate-900/50 transition-all group cursor-pointer"
    >
      <div className="text-slate-400 text-xs sm:text-sm mb-2">{label}</div>
      <div className={`text-lg sm:text-xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform break-words`}>
        {value}
      </div>
    </div>

  );
}
