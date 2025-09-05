import type { LucideIcon } from 'lucide-react';
import { BadgeDollarSign, CheckCircle, Code, Copy, ExternalLink } from 'lucide-react';
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
    navigator.clipboard.writeText(env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };
  return (
    <Card>
      <CardContent>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
            <BadgeDollarSign className="w-8 h-8 text-slate-900" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {title}
              </h2>
              <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/20 rounded-full">
                <span className="text-emerald-400 text-sm font-medium">Active</span>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {subtitle}
            </p>

            <p>{description}</p>

            {/* Contract Address */}
            <div className="flex items-center gap-2 py-3 bg-slate-900/30 rounded-lg">
              <Code className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 text-sm">Contract:</span>
              <code className="text-emerald-400 font-mono text-sm">{env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS}</code>
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
              <a href={`https://sepolia.etherscan.io/address/${env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors" />
              </a>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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
