import ProposalList from '@/features/proposal-list';

export function generateStaticParams() {
  return [
    { source: 'on-chain' },
    { source: 'off-chain' },
  ];
}

export default async function Page(props: { params: Promise<{ source: 'on-chain' | 'off-chain' }> }) {
  const params = await props.params;
  return (
    <ProposalList source={params.source} />
  );
}
