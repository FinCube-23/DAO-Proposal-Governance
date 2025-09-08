import { useParams } from 'react-router';
import ProposalList from '@/features/proposal-list';

export default function ProposalsPage() {
  const { source } = useParams();
  return (
    <div>
      <ProposalList source={source as 'on-chain' | 'off-chain'} />
    </div>
  );
}
