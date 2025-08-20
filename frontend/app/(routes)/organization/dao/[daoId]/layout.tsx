import DaoDetails from '@/features/dao-details';

export default function DaoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: { daoId: string };
}>) {
  return (
    <div>
      <DaoDetails />
      {children}
    </div>
  );
}
