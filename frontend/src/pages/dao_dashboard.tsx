import { Button } from "@components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@components/ui/card";
import { Box, Flag, Vote, WalletCards, History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { readContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import contractABI from "../contractABI/contractABI.json";
import { useAccount } from "wagmi";
import { config } from "../main";

import { Badge } from "@components/ui/badge";
import { IDaoInfo } from "@lib/interfaces";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import AllProposals from "@components/dao/AllProposals";
import OngoingProposals from "@components/dao/OngoingProposals";
import OffchainProposals from "@components/dao/OffchainProposals";

export default function DaoDashboard() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [daoURI, setDaoURI] = useState<IDaoInfo>();
  const [activeTab, setActiveTab] = useState("proposals");

  const [proposalCount, setProposalCount] = useState(0);
  const [version, setVersion] = useState("");
  const [votingPeriod, setVotingPeriod] = useState("");
  const [votingDelay, setVotingDelay] = useState("");
  const { isConnected, address } = useAccount();

  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("ongoing-proposals")) {
      setActiveTab("ongoing-proposals");
    } else if (path.includes("off-chain-proposals")) {
      setActiveTab("off-chain-proposals");
    } else {
      setActiveTab("proposals");
    }
  }, [location]);

  const readContractValue = async (
    functionName: string,
    setter: (value: any) => void,
    transform: (value: any) => any = (val) => val.toString()
  ) => {
    try {
      const response: any = await readContract(config, {
        abi: contractABI,
        address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
        functionName,
      });
      const result = transform(response);
      setter(result);
    } catch (e) {
      console.error(`Error in ${functionName}:`, e);
    }
  };

  useEffect(() => {
    const getDAOInfo = async () => {
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
          functionName: "daoURI",
        });
        const parsedObj = JSON.parse(response);

        setDaoURI(parsedObj);
      } catch (e) {
        console.error(e);
      }
    };

    const getVotingPeriod = () =>
      readContractValue("votingPeriod", setVotingPeriod);

    const getVotingDelay = () =>
      readContractValue("votingDelay", setVotingDelay);

    const getProposalCount = () =>
      readContractValue("proposalCount", setProposalCount, (val) =>
        Number(val)
      );

    const getVersion = () =>
      readContractValue("UPGRADE_INTERFACE_VERSION", setVersion);

    getDAOInfo();
    getVersion();
    getVotingDelay();
    getProposalCount();
    getVotingPeriod();
    setLoading(false);
  }, [address, isConnected]);

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center">
              <a
                className="text-2xl hover:underline"
                href={`${daoURI?.["@context"]}`}
                target="_"
              >
                {daoURI?.name}
              </a>
              <div className="flex gap-3">
                <Badge variant="secondary">
                  Voting Period: {votingPeriod} second(s)
                </Badge>
                <Badge variant="secondary">
                  Voting Delay: {votingDelay} second(s)
                </Badge>
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            <a
              href="#"
              className="text-sm text-green-500 cursor-pointer hover:underline"
            ></a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{daoURI?.description}</p>
        </CardContent>
        <CardFooter>
          <div className="flex gap-10 text-sm justify-center items-center">
            <div className="flex gap-5">
              <div className="flex gap-1">
                <Flag className="text-green-500" /> December 2023
              </div>
              <div className="flex gap-1">
                <Box className="text-green-500" />
                Polygon
              </div>
              <div className="flex gap-1">
                <WalletCards className="text-green-500" />
                Wallet-based
              </div>
              <div className="flex gap-1">
                <History className="text-green-500" />
                {version}
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
      <div className="md:col-span-7 flex flex-col gap-5">
        <Card>
          <div className="flex justify-between items-center p-3">
            <div className="flex items-center gap-3">
              <Vote className="text-green-500" />
              <p>
                {loading
                  ? "Loading proposals..."
                  : `Total proposals: ${proposalCount}`}
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>New Proposal</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-center">
                    Proposal Type
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center">
                  <Button
                    onClick={() =>
                      navigate("/organization/dao/fincube/general-proposal")
                    }
                    className="my-2 w-60 hover:bg-green-400"
                  >
                    General Proposal
                  </Button>
                  <Button
                    onClick={() =>
                      navigate("/organization/dao/fincube/approval-proposal")
                    }
                    className="my-2 w-60 hover:bg-orange-400"
                  >
                    New Member Approval Proposal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          const newPath = `dao/fincube/${value}`;
          navigate(`/organization/${newPath}`);
        }}
        className="space-y-4"
      >
        <TabsList className="rounded-xl">
          <TabsTrigger className="rounded-xl" value="proposals">
            All Proposals
          </TabsTrigger>
          <TabsTrigger className="rounded-xl" value="ongoing-proposals">
            Ongoing Proposals
          </TabsTrigger>
          <TabsTrigger className="rounded-xl" value="off-chain-proposals">
            Off-chain Proposals
          </TabsTrigger>
        </TabsList>
        <TabsContent value="proposals" className="space-y-4">
          <AllProposals />
        </TabsContent>
        <TabsContent value="ongoing-proposals" className="space-y-4">
          <OngoingProposals />
        </TabsContent>
        <TabsContent value="off-chain-proposals" className="space-y-4">
          <OffchainProposals />
        </TabsContent>
      </Tabs>
    </div>
  );
}
