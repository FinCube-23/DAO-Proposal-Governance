import { useParams } from 'react-router';
import AuditTransactionDetails from '@/features/audit-transaction-details';

export default function AuditTransactionsDetailsPage() {
  const { id } = useParams();
  return (
    <div>
      <AuditTransactionDetails id={id} />
    </div>
  );
}
