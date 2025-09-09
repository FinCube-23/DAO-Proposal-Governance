import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function ProposalsPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/organization/dao/proposals/on-chain');
  }, []);

  return (
    <div>Redirecting...</div>
  );
}
