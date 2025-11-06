import { Blocks, Database, Plus, RotateCcw, ScrollText, User } from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import '@rainbow-me/rainbowkit/styles.css';

export default function ProposalsLayout() {
  const navigate = useNavigate();
  const { source: activeTab } = useParams();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Proposals</h1>
          <p className="text-sm sm:text-base text-slate-400">Participate in DAO governance and decision making</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-base sm:text-lg">Select Proposal Type</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-6">
              <Link to="/organization/dao/proposals/create?type=general" className="w-full flex flex-col gap-2 border border-green-400 rounded-xl items-center justify-center p-4 sm:p-3 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-cyan-600 hover:border-none text-sm sm:text-base">
                <ScrollText className="w-5 h-5 sm:w-6 sm:h-6" />
                General Proposal
              </Link>
              <Link to="/organization/dao/proposals/create?type=member" className="w-full flex flex-col gap-2 border border-green-400 rounded-xl items-center justify-center p-4 sm:p-3 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-cyan-600 hover:border-none text-sm sm:text-base">
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
                New Member Proposal
              </Link>
            </div>
          </DialogContent>
        </Dialog>

        <Button onClick={() => setIsOpen(true)} className="w-fit self-end sm:w-auto text-sm sm:text-base h-9 sm:h-10">
          <Plus className="w-4 h-4" />
          Create Proposal
        </Button>
      </div>

      <div className="w-fit sm:w-fit">
        <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <button
            type="button"
            onClick={() => navigate('/organization/dao/proposals/on-chain')}
            className={`flex cursor-pointer items-center gap-2 px-3 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'on-chain'
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Blocks className="w-3 h-3 sm:w-4 sm:h-4" />
            On-chain
          </button>
          <button
            type="button"
            onClick={() => navigate('/organization/dao/proposals/ongoing')}
            className={`flex cursor-pointer items-center gap-2 px-3 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'ongoing'
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
            Ongoing
          </button>
          <button
            type="button"
            onClick={() => navigate('/organization/dao/proposals/off-chain')}
            className={`flex cursor-pointer items-center gap-2 px-3 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'off-chain'
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3 h-3 sm:w-4 sm:h-4" />
            Off-chain
          </button>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
