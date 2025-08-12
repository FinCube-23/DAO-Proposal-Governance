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
    <div className="w-full bg-black bg-grid-small-white/[0.2] relative flex items-center justify-center">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <SidebarProvider className="z-50">
        <UserEnrollStepper />
        <OrgSidebar />
        <main className="w-full h-screen">
          <OrgHeader />
          <div className="container mx-auto mt-24 h-full">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
