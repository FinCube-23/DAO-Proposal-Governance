'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import OffChainProposals from './components/off-chain-proposals';
import OnChainProposals from './components/on-chain-proposals';
import OngoingProposals from './components/on-going-proposals';
import { filterOptions } from './utils';

interface Props {
  source: 'on-chain' | 'off-chain';
}

export default function ProposalList({ source }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
          </div>
        </div>

        <Select onValueChange={value => setStatusFilter(value)} value={statusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {filterOptions[source].map(option => (
                <SelectItem key={option} value={option}>
                  <span className="capitalize">
                    {option}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {source === 'off-chain'
        ? <OffChainProposals filter={statusFilter} search={search} />
        : statusFilter === 'all' ? <OnChainProposals /> : <OngoingProposals />}
    </div>
  );
}
