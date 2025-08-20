import UserEnrollStepper from '@/features/user-enroll-stepper';
import OrgHeader from '@/shared/components/layout/org-header';
import OrgSidebar from '@/shared/components/layout/org-sidebar';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';

export default function OrganizationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <UserEnrollStepper />
      <OrgSidebar />
      <SidebarInset>
        <OrgHeader />
        <main>
          <div className="container mx-auto pt-4 px-4 lg:px-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
