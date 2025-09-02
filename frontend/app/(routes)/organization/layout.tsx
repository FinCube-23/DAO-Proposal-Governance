'use client';

import UserEnrollStepper from '@/features/user-enroll-stepper';
import ApprovalNotification from '@/shared/components/approval-notification';
import OrgHeader from '@/shared/components/layout/org-header';
import OrgSidebar from '@/shared/components/layout/org-sidebar';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';
import useAuthStore from '@/shared/stores/auth';

export default function OrganizationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = useAuthStore(state => state.profile);
  const showNotification = profile?.status === 'pending' || profile?.status === 'approved';

  return (
    <SidebarProvider>
      <UserEnrollStepper />
      <OrgSidebar />
      <SidebarInset>
        <ApprovalNotification />
        <OrgHeader />
        <main>
          <div className={`container mx-auto mb-12 px-4 lg:px-8 ${showNotification ? 'mt-40' : 'mt-28'}`}>
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
