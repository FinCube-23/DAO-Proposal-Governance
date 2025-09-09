import { useSearchParams } from 'react-router';
import ProposalCreate from '@/features/proposal-create';

export default function ProposalsCreatePage() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  return (
    <ProposalCreate type={type === 'member' ? 'member' : 'general'} />
  );
}
