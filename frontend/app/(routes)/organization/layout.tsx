import UserEnrollStepper from '@/features/user-enroll-stepper';
import OrgHeader from '@/shared/components/layout/org-header';
import OrgSidebar from '@/shared/components/layout/org-sidebar';
import { SidebarProvider } from '@/shared/components/ui/sidebar';

export default function OrganizationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full relative flex items-center justify-center">
      <SidebarProvider className="z-50">
        <UserEnrollStepper />
        <OrgSidebar />
        <main className="w-full">
          <OrgHeader />
          <div className="container mx-auto my-24 px-4 lg:px-8">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
