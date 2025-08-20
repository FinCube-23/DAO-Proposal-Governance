export function generateStaticParams() {
  return [
    { daoId: 'fincube' },
  ];
}

export default async function Dao({ params }: { params: { daoId: string } }) {
  const { daoId } = await params;
  return (
    <div>
      Hello
      {daoId}
    </div>
  );
}
