'use client';

import { Blocks, Database, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Button } from '@/shared/components/ui/button';

export default function OrganizationLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ source: string }>;
}>) {
  const router = useRouter();
  const resolvedParams = use(params);
  const activeTab = resolvedParams.source;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Proposals</h1>
          <p className="text-slate-400">Participate in DAO governance and decision making</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Create Proposal
        </Button>
      </div>

      <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50 w-fit">
        <button
          type="button"
          onClick={() => router.push('/organization/dao/proposals/on-chain')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'on-chain'
              ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Blocks className="w-4 h-4" />
          On-chain
        </button>
        <button
          type="button"
          onClick={() => router.push('/organization/dao/proposals/off-chain')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'off-chain'
              ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          Off-chain
        </button>
      </div>

      {children}
    </div>
  );
}
