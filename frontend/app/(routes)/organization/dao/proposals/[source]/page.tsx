import ProposalList from '@/features/proposal-list';

export function generateStaticParams() {
  return [
    { source: 'on-chain' },
    { source: 'off-chain' },
  ];
}

export default function Page({ params }: { params: { source: 'on-chain' | 'off-chain' } }) {
  return (
    <ProposalList source={params.source} />
  );
}
