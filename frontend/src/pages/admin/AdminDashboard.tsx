import { Overview } from "@components/admin/overview";
import { RecentTransactions } from "@components/admin/recent-transactions";
import { Badge } from "@components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Tabs, TabsContent } from "@components/ui/tabs";
import { IProposal } from "@lib/interfaces";
import { config } from "../../main";
import {
  useLazyCheckIsMemberApprovedQuery,
  useLazyGetBalanceQuery,
  useLazyGetOngoingProposalsQuery,
  useLazyGetProposalThresholdQuery,
} from "@redux/services/proxy";
import { readContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import contractABI from "../../contractABI/contractABI.json";

export default function AdminDashboard() {
  const [balance, setBalance] = useState<string>();
  const [threshold, setThreshold] = useState<string>();
  const [ongoingProposals, setOngoingProposals] = useState<IProposal[]>();
  const [approvalStatus, setApprovalStatus] = useState<boolean>();
  const { address } = useAccount();

  // RTK Query
  const [getBalance] = useLazyGetBalanceQuery();
  const [getProposalThreshold] = useLazyGetProposalThresholdQuery();
  const [getOngoingProposals] = useLazyGetOngoingProposalsQuery();
  const [checkIsMemberApproved] = useLazyCheckIsMemberApprovedQuery();
  const [proposalCount, setProposalCount] = useState<string>();

  useEffect(() => {
    const checkIsMember = async () => {
      const data = { address: `${address}` };

      if (address) {
        try {
          const response: any = await checkIsMemberApproved(data);
          console.log(response.data);
          setApprovalStatus(response.data);
        } catch (e) {
          console.error(e);
        }
      }
    };

    const walletBalance = async () => {
      const data = { address: `${address}` };

      if (address) {
        try {
          const response: any = await getBalance(data);
          const convertedValue = parseFloat(
            formatEther(BigInt(response.data))
          ).toFixed(2);
          setBalance(convertedValue);
          console.log(convertedValue);
        } catch (e) {
          console.error(e);
        }
      }
    };

    const proposalThreshold = async () => {
      try {
        const response: any = await getProposalThreshold();
        setThreshold(response.data);
        console.log(response.data);
      } catch (e) {
        console.error(e);
      }
    };

    const getProposalCount = async () => {
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
          functionName: "proposalCount",
        });
        const result = response.toString();

        console.log("Proposal Count:", result);
        setProposalCount(result);
      } catch (e) {
        console.error(e);
      }
    };

    const getTotalOngoingProposals = async () => {
      try {
        const response: any = await getOngoingProposals();
        const activeProposals = response.data.length;
        setOngoingProposals(activeProposals);
      } catch (e) {
        console.error(e);
      }
    };

    getTotalOngoingProposals();
    getProposalCount();
    checkIsMember();
    walletBalance();
    proposalThreshold();
  }, [
    getBalance,
    getProposalThreshold,
    checkIsMemberApproved,
    getOngoingProposals,
    address,
  ]);

  return (
    <>
      <div className="md:hidden">
        <img
          src="/examples/dashboard-light.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="block dark:hidden"
        />
        <img
          src="/examples/dashboard-dark.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="hidden dark:block"
        />
        h-5 h-5
      </div>
      <div className="hidden flex-col md:flex">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          </div>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Balance
                    </CardTitle>
                    <Badge variant="secondary">On-chain</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{balance} ETH</div>
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
                    {approvalStatus ? (
                      <Badge variant="success" className="h-5" />
                    ) : (
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
                      Total number of proposals: {proposalCount}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentTransactions proposalCount={proposalCount} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
