'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Proposals() {
  const router = useRouter();

  useEffect(() => {
    router.push('/organization/dao/proposals/on-chain');
  }, [router]);
}
