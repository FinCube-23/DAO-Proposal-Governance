import { useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router';

export default function OrganizationAuditPage() {
  const navigate = useNavigate();
  const activeTab = useMemo(() => {
    if (location.pathname.includes('organizations'))
      return 'organizations';
    else if (location.pathname.includes('transactions'))
      return 'transactions';
    return 'dashboard';
  }, [location.pathname]);

  return (
    <div className="flex flex-col lg:gap-6 gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Web3 transaction monitoring across multiple resources
        </p>
      </div>

      <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50 w-fit">
        <button
          type="button"
          onClick={() => navigate('/organization/audit/dashboard')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'dashboard'
              ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Dashboard
        </button>
        <button
          type="button"
          onClick={() => navigate('/organization/audit/organizations')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'organizations'
              ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Organization List
        </button>
        <button
          type="button"
          onClick={() => navigate('/organization/audit/transactions')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'transactions'
              ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Transaction List
        </button>
      </div>
      <Outlet />
    </div>
  );
}
