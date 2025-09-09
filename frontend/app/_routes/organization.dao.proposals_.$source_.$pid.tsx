import { useParams } from 'react-router';
import ProposalView from '@/features/proposal-view';

export default function ProposalViewPage() {
  const { source, pid } = useParams();

  return (
    <ProposalView source={source} pid={pid} />
  );
}
