import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function OrganizationAdminIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/organization/audit/dashboard');
  }, [navigate]);

  return (
    <div>Redirecting...</div>
  );
}
