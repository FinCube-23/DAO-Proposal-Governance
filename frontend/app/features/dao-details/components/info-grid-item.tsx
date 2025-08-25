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
      className="p-4 bg-slate-900 rounded-lg hover:bg-slate-900/50 transition-colors group"
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-emerald-400 group-hover:text-cyan-400 transition-colors" />
        <span className="text-slate-400 text-sm">{label}</span>
      </div>
      <div className="text-white font-semibold mb-1">{value}</div>
      <div className="text-slate-500 text-xs">{description}</div>
    </div>
  );
}
