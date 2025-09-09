import { Blocks, Database, Plus, ScrollText, User } from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import '@rainbow-me/rainbowkit/styles.css';

export default function ProposalsLayout() {
  const navigate = useNavigate();
  const { source: activeTab } = useParams();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Proposals</h1>
          <p className="text-slate-400">Participate in DAO governance and decision making</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">Select Proposal Type</DialogTitle>
            </DialogHeader>
            <div className="flex gap-6 mt-6">
              <Link to="/organization/dao/proposals/create?type=general" className="w-full flex flex-col gap-2 border border-green-400 rounded-xl items-center justify-center p-3 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-cyan-600 hover:border-none">
                <ScrollText className="size-6" />
                General Proposal
              </Link>
              <Link to="/organization/dao/proposals/create?type=member" className="w-full flex flex-col gap-2 border border-green-400 rounded-xl items-center justify-center p-3 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-cyan-600 hover:border-none">
                <User className="size-6" />
                New Member Proposal
              </Link>
            </div>
          </DialogContent>
        </Dialog>

        <Button onClick={() => setIsOpen(true)}>
          <Plus className="w-4 h-4" />
          Create Proposal
        </Button>
      </div>

      <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50 w-fit">
        <button
          type="button"
          onClick={() => navigate('/organization/dao/proposals/on-chain')}
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
          onClick={() => navigate('/organization/dao/proposals/off-chain')}
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
      <Outlet />
    </div>
  );
}
