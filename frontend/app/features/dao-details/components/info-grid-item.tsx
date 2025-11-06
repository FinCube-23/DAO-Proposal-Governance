import type { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  icon: LucideIcon;
  value: string | number;
  description?: string;
}
export default function InfoGridItem({ label, icon: Icon, value, description }: Props) {
  return (
    <div
      className="p-3 sm:p-4 bg-slate-900 rounded-lg hover:bg-slate-900/50 transition-colors group"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-2">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
        <span className="text-slate-400 text-xs sm:text-sm">{label}</span>
      </div>
      <div className="text-white text-sm sm:text-base font-semibold mb-1 break-words">{value}</div>
      <div className="text-slate-500 text-xs">{description}</div>
    </div>
  );
}
