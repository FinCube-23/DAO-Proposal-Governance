import { Outlet } from 'react-router';
import UserEnrollStepper from '@/features/user-enroll-stepper';
import ApprovalNotification from '@/shared/components/layout/approval-notification';
import OrgHeader from '@/shared/components/layout/org-header';
import OrgSidebar from '@/shared/components/layout/org-sidebar';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';
import { cn } from '@/shared/utils';

export default function OrganizationLayout() {
  return (
    <SidebarProvider>
      <UserEnrollStepper />
      <OrgSidebar />
      <SidebarInset>
        <OrgHeader />
        <ApprovalNotification />
        <main>
          <div className={cn('container mx-auto mt-28 mb-12 px-4 lg:px-8')}>
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
