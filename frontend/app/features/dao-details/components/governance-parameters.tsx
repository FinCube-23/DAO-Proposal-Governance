import { Landmark } from 'lucide-react';
import GovernanceItem from './governance-item';

interface Props {
  governanceItems: {
    label: string;
    value: string | number;
    gradient: string;
  }[];
}

export default function GovernanceParameters({ governanceItems }: Props) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white">Governance Parameters</h3>
          <p className="text-slate-400 text-xs sm:text-sm">Key metrics and thresholds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {governanceItems.map(item => (
          <GovernanceItem
            key={item.label}
            label={item.label}
            gradient={item.gradient}
            value={item.value}
          />
        ))}
      </div>
    </div>
  );
}
