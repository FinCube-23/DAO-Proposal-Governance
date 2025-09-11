import { useParams } from 'react-router';
import ProposalList from '@/features/proposal-list';

export default function ProposalsPage() {
  const { source } = useParams();

  return (
    <ProposalList source={source as 'off-chain' | 'on-chain' | 'ongoing'} />
  );
}
