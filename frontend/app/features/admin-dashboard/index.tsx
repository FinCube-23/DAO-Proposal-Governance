import type { IProposal } from '@/core/api/interfaces';
import { useMutation } from '@tanstack/react-query';
import { readContract } from '@wagmi/core';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { config } from '@/core/config';
import contractABI from '@/core/contract/contract-abi.json';
import { env } from '@/core/env';
import { proxyApis } from '@/core/services/proxy';
import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Overview } from './components/overview';
import { RecentTransactions } from './components/recent-transactions';

export default function AdminDashboard() {
  const [balance, setBalance] = useState<string>();
  const [threshold, setThreshold] = useState<string>();
  const [ongoingProposals, setOngoingProposals] = useState<IProposal[]>();
  const [approvalStatus, setApprovalStatus] = useState<boolean>();
  const { address } = useAccount();

  // RTK Query
  const [proposalCount, setProposalCount] = useState<string>();

  const getBalance = useMutation({
    mutationKey: ['getBalance'],
    mutationFn: proxyApis.getBalance,
    onSuccess: (data) => {
      try {
        // Handle different response structures
        let balanceValue;

        if (data && typeof data === 'object') {
          // Try different possible response structures
          balanceValue = data.data || data.balance || data.result || data;
        }
        else {
          balanceValue = data;
        }
        if (balanceValue === undefined || balanceValue === null || balanceValue === '') {
          setBalance('0.00');
          return;
        }

        // Handle zero balance (which is valid)
        if (balanceValue === '0' || balanceValue === 0) {
          setBalance('0.00');
          return;
        }

        // Convert to BigInt and format
        const bigIntValue = typeof balanceValue === 'string' ? BigInt(balanceValue) : BigInt(balanceValue);
        const convertedValue = Number.parseFloat(formatEther(bigIntValue)).toFixed(2);

        setBalance(convertedValue);
      }
      catch (conversionError) {
        setBalance('0.00');
        console.error(conversionError);
      }
    },
    onError: (error) => {
      console.error('Get balance failed', error);
      setBalance('0.00'); // Set default value on error
    },
  });

  const getProposalThreshold = useMutation({
    mutationKey: ['getProposalThreshold'],
    mutationFn: proxyApis.getProposalThreshold,
    onSuccess: (data) => {
      setThreshold(data as any);
    },
    onError: (error) => {
      console.error('Get proposal threshold failed', error);
    },
  });

  const getOngoingProposals = useMutation({
    mutationKey: ['getOngoingProposals'],
    mutationFn: proxyApis.getOngoingProposals,
    onSuccess: (data) => {
      setOngoingProposals(data as any);
    },
    onError: (error) => {
      console.error('Get ongoing proposals failed', error);
    },
  });

  const checkIsMemberApproved = useMutation({
    mutationKey: ['checkIsMemberApproved'],
    mutationFn: proxyApis.checkIsMemberApproved,
    onSuccess: (data) => {
      setApprovalStatus(data);
    },
    onError: (error) => {
      console.error('Check member approval failed', error);
    },
  });

  useEffect(() => {
    const checkIsMember = async () => {
      const data = { address: `${address}` };

      checkIsMemberApproved.mutate(data);
    };

    const walletBalance = async () => {
      const data = { address: `${address}` };
      if (address) {
        getBalance.mutate(data);
      }
    };

    const proposalThreshold = async () => {

    };

    const getProposalCount = async () => {
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: env.VITE_SMART_CONTRACT_ADDRESS as `0x${string}`,
          functionName: 'proposalCount',
        });
        const result = response.toString();

        setProposalCount(result);
      }
      catch (e) {
        console.error(e);
      }
    };

    const getTotalOngoingProposals = async () => {
      getOngoingProposals.mutate();
    };

    const getTotalProposalThreshold = async () => {
      getProposalThreshold.mutate();
    };

    getTotalOngoingProposals();
    getProposalCount();

    if (address) {
      checkIsMember();
      walletBalance();
    }

    proposalThreshold();
    getTotalProposalThreshold();
  }, [
    address,
  ]);

  return (
    <div className="hidden flex-col md:flex">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Balance
              </CardTitle>
              <Badge variant="secondary">On-chain</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getBalance.isPending
                  ? (
                      <span className="text-muted-foreground">Loading...</span>
                    )
                  : balance
                    ? (
                        <>
                          {balance}
                          {' '}
                          ETH
                        </>
                      )
                    : (
                        <span className="text-muted-foreground">--</span>
                      )}
              </div>
              <p className="text-xs text-muted-foreground">
                Your wallet balance
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Membership Status
              </CardTitle>
              <Badge variant="secondary">On-chain</Badge>
              {approvalStatus
                ? (
                    <Badge variant="success" className="h-5" />
                  )
                : (
                    <Badge variant="warning" className="h-5" />
                  )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {approvalStatus ? <p>Approved</p> : <p>Pending</p>}
              </div>
              <p className="text-xs text-muted-foreground">
                Your membership approval status
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Proposal Threshold
              </CardTitle>
              <Badge variant="secondary">On-chain</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{threshold}</div>
              <p className="text-xs text-muted-foreground">
                Minimum number of votes needed to execute
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Ongoing Proposals
              </CardTitle>
              <Badge variant="secondary">On-chain</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ongoingProposals?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Proposals currently active for casting vote
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Proposals</CardTitle>
                <Badge variant="secondary">On-chain</Badge>
              </div>
              <CardDescription>
                Total number of proposals:
                {' '}
                {proposalCount}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentTransactions />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
