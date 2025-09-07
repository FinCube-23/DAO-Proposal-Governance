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
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Landmark className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Governance Parameters</h3>
          <p className="text-slate-400 text-sm">Key metrics and thresholds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
