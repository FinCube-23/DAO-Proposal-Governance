import type { LucideIcon } from 'lucide-react';
import { BadgeDollarSign, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { env } from '@/core/env';
import { Card, CardContent } from '@/shared/components/ui/card';
import InfoGridItem from './info-grid-item';

interface Props {
  title: string;
  subtitle: string;
  description: string;
  infoItems: {
    label: string;
    value: string | number;
    icon: LucideIcon;
    description: string;
  }[];
}

export default function DetailsCard({ title, subtitle, description, infoItems }: Props) {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(env.VITE_SMART_CONTRACT_ADDRESS);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
            <BadgeDollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-slate-900" />
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {title}
              </h2>
              <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/20 rounded-full w-fit">
                <span className="text-emerald-400 text-xs sm:text-sm font-medium">Active</span>
              </div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4">
              {subtitle}
            </p>

            <p className="text-sm sm:text-base mb-3 sm:mb-4">{description}</p>

            {/* Contract Address */}
            <div className="flex items-center gap-2 p-2 sm:py-3 sm:px-3 bg-slate-900/30 rounded-lg overflow-x-auto scrollbar-hide">
              <span className="text-slate-400 text-xs sm:text-sm whitespace-nowrap">Contract:</span>
              <code className="text-emerald-400 font-mono text-xs sm:text-sm break-all flex-1 min-w-0">{env.VITE_SMART_CONTRACT_ADDRESS}</code>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={copyAddress}
                  className="p-1 cursor-pointer hover:bg-slate-700/50 rounded transition-colors"

                >
                  {copiedAddress
                    ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      )
                    : (
                        <Copy className="w-4 h-4 text-slate-400 hover:text-emerald-400" />
                      )}
                </button>
                <a href={`https://sepolia.etherscan.io/address/${env.VITE_SMART_CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {infoItems.map(item => (
            <InfoGridItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              value={item.value}
              description={item.description}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
