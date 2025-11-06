import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useMemo(() => {
    if (location.pathname.includes('organizations'))
      return 'organizations';
    else if (location.pathname.includes('transactions'))
      return 'transactions';
    return 'dashboard';
  }, [location.pathname]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50 w-full sm:w-fit overflow-x-auto scrollbar-hide">
        <button
          type="button"
          onClick={() => navigate('/organization/admin/dashboard')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center ${
            activeTab === 'dashboard'
              ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Dashboard
        </button>
        <button
          type="button"
          onClick={() => navigate('/organization/admin/organizations')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center ${
            activeTab === 'organizations'
              ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Organization List
        </button>
        <button
          type="button"
          onClick={() => navigate('/organization/admin/transactions')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center ${
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
