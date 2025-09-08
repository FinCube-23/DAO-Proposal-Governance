import { Outlet } from 'react-router';
import UserEnrollStepper from '@/features/user-enroll-stepper';
import OrgHeader from '@/shared/components/layout/org-header';
import OrgSidebar from '@/shared/components/layout/org-sidebar';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';

export default function OrganizationLayout() {
  return (
    <SidebarProvider>
      <UserEnrollStepper />
      <OrgSidebar />
      <SidebarInset>
        <OrgHeader />
        <main>
          <div className="container mx-auto mt-28 mb-12 px-4 lg:px-8">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
