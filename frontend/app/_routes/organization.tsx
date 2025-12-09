import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { toast } from 'sonner';

import UserEnrollStepper from '@/features/user-enroll-stepper';
import OrgHeader from '@/shared/components/layout/org-header';
import OrgSidebar from '@/shared/components/layout/org-sidebar';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';
import useAuthStore from '@/shared/stores/auth';
import { cn } from '@/shared/utils';

export default function OrganizationLayout() {
  const authStore = useAuthStore(state => state);
  const navigate = useNavigate();

  useEffect(() => {
    if (authStore.isHydrated && !authStore.access) {
      toast.info('Please login to continue');
      navigate('/login');
    }
  }, [authStore.isHydrated, authStore.access]);

  return (
    <SidebarProvider>
      <UserEnrollStepper />
      <OrgSidebar />
      <SidebarInset>
        <OrgHeader />
        <main>
          <div className={cn('container mx-auto mb-12 px-4 lg:px-8 mt-20')}>
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
