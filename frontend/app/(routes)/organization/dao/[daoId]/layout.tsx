export default function OrganizationLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { daoId: string };
}>) {
  return (
    <div>
      {children}
    </div>
  );
}
