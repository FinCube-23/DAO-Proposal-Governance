import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

export default function SuperAdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useMemo(() => {
    if (location.pathname.includes('organizations'))
      return 'organizations';
    else if (location.pathname.includes('users'))
      return 'users';
    else if (location.pathname.includes('onchain-verifications'))
      return 'onchain-verifications';
    return 'dashboard';
  }, [location.pathname]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Admin Panel</h2>
      <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        <div className="inline-flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700/50 min-w-max">
          <button
            type="button"
            onClick={() => navigate('/organization/superadmin/dashboard')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate('/organization/superadmin/organizations')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'organizations'
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Organizations
          </button>
          <button
            type="button"
            onClick={() => navigate('/organization/superadmin/users')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Users
          </button>
          <button
            type="button"
            onClick={() => navigate('/organization/superadmin/onchain-verifications')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'onchain-verifications'
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">Onchain Verifications</span>
            <span className="sm:hidden">Verifications</span>
          </button>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
