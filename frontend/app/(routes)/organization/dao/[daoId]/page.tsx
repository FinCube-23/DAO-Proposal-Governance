export function generateStaticParams() {
  return [
    { daoId: 'fincube' },
  ];
}

export default function Dao({ params }: { params: { daoId: string } }) {
  return (
    <div>
      Hello
      {params.daoId}
    </div>
  );
}
