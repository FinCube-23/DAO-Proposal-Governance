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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import { useLazyGetAllMFSQuery } from "@redux/services/mfs";
import { MFSBusiness } from "@redux/api/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useNavigate } from "react-router";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [getAllMFS, { data, error, isLoading }] = useLazyGetAllMFSQuery();
  const [mfsList, setMfsList] = useState<MFSBusiness[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<string | undefined>();
  const navigate = useNavigate();

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

  useEffect(() => {
    const getMFSs = async () => {
      try {
        const response: any = await getAllMFS({
          page: page,
          limit: limit,
          status: status,
        });

        console.log("MFS data", response.data);
        setMfsList(response.data.data);
      } catch (e) {
        console.error(e);
      }
    };

    getMFSs();
  }, [page, status, getAllMFS, limit]);

  useEffect(() => {
    if (data) {
      setMfsList(data.data);
      setTotalPages(data.totalPages);
    }
  }, [data]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

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
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="mfs-list">MFS List</TabsTrigger>
            </TabsList>
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
            <TabsContent value="mfs-list" className="space-y-4">
              <div className="flex justify-end">
                <div className="w-[200px]">
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="register">Registered</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="cancelled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Membership Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mfsList.map((mfs) => (
                    <TableRow
                      onClick={() =>
                        navigate(`/admin/dashboard/mfs-details/${mfs.id}`)
                      }
                      className="hover:bg-gray-800 hover:cursor-pointer"
                      key={mfs.id}
                    >
                      <TableCell>{mfs.id}</TableCell>
                      <TableCell>{mfs.name}</TableCell>
                      <TableCell>{mfs.type}</TableCell>
                      <TableCell>{mfs.location}</TableCell>
                      <TableCell>{mfs.membership_onchain_status}</TableCell>
                      <TableCell>{formatDate(mfs.created_at)}</TableCell>
                      <TableCell>{formatDate(mfs.updated_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {mfsList.length === 0 && (
                <p className="text-center font-bold">No data found</p>
              )}
              {mfsList.length > 0 && (
                <Pagination className="my-5">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        className={`${
                          page === 1 && "pointer-events-none opacity-50"
                        } cursor-pointer`}
                        onClick={() => {
                          setPage((prev) => Math.max(1, prev - 1));
                        }}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(pageNum);
                            }}
                            isActive={Number(setPage) === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        className={`${
                          page === totalPages &&
                          "pointer-events-none opacity-50"
                        } cursor-pointer`}
                        onClick={() => {
                          setPage((prev) => Math.min(totalPages, prev + 1));
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
