import { AnnualTransferLine } from "@components/mfs/AnnualTransferLine";
import DisplayCard from "@components/mfs/DisplayCard";
import { ExchangeRatePie } from "@components/mfs/ExchangeRatePie";
import { LiquidityRatioBar } from "@components/mfs/LiquidityRatioBar";
import contractABI from "../../contractABI/contractABI.json";
import { config } from "@layouts/RootLayout";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { RootState } from "@redux/store";
import { useSelector } from "react-redux";
import { useAccount, useConnect } from "wagmi";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import {
  useLazyGetProposalCountQuery,
  useLazyGetProposalThresholdQuery,
} from "@redux/services/proxy";
import { readContract } from "@wagmi/core";
import WalletAuth from "@components/auth/WalletAuth";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function MfsDashboard() {
  const { address, isConnected } = useAccount();
  const { connectors } = useConnect();
  const [getProposalThreshold] = useLazyGetProposalThresholdQuery();
  const [getProposalCount] = useLazyGetProposalCountQuery();
  const [proposalCount, setProposalCount] = useState("Unauthorized");
  const [proposalThreshold, setProposalThreshold] = useState("Unauthorized");

  useEffect(() => {
    if (address) {
      toast.success("Wallet connected!");
    } else if (!connectors) {
      toast.error("Failed to connect wallet");
    }
  }, [address, connectors]);

  useEffect(() => {
    // getProposalCount
    const fetchProposalCount = async () => {
      try {
        const response = await getProposalCount();
        setProposalCount(response.data.toString());
        console.log(response.data);
      } catch (e) {
        console.error(e);
      }
    };

    // getProposalThreshold
    const fetchProposalThreshold = async () => {
      try {
        const response = await getProposalThreshold();
        setProposalThreshold(response.data.toString());
        console.log(response);
      } catch (e) {
        console.error(e);
      }
    };

    fetchProposalCount();
    fetchProposalThreshold();
  }, [getProposalCount, getProposalThreshold]);

  const auth = useSelector(
    (state: RootState) => state.persistedReducer.authReducer.auth
  );

  useEffect(() => {
    const checkIsMemberApproved = async () => {
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F",
          functionName: "checkIsMemberApproved",
          args: [address],
        });

        console.log(response);
      } catch (e) {
        console.error(e);
      }
    };
    if (isConnected) {
      checkIsMemberApproved();
    }
  }, [address, isConnected]);

  return (
    <div className="border min-h-96 rounded-xl mt-10 pb-10">
      <WalletAuth></WalletAuth>
      <Toaster></Toaster>
      <div className="relative">
        <Card className="w-64 absolute -top-8 left-8">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome,</CardTitle>
            <CardDescription>{auth?.mfs?.name}</CardDescription>
          </CardHeader>
        </Card>
      </div>
      <div className="flex justify-end relative">
        <div className="absolute top-8 right-8">
          <ConnectButton />
        </div>
      </div>
      <div className="flex flex-col gap-8 pt-28 px-8">
        <div className="flex gap-8 justify-center">
          <div>
            <DisplayCard title="Liquidity Ratio" value="0.7m USD" />
          </div>
          <div className="">
            <div className="w-64">
              <ExchangeRatePie />
            </div>
          </div>
          <div>
            <DisplayCard
              title="Total Number of Proposals"
              value={proposalCount}
            />
          </div>
          <div>
            <DisplayCard title="Proposal Threshold" value={proposalThreshold} />
          </div>
        </div>

        <div className="flex justify-center gap-8">
          <LiquidityRatioBar />
          <AnnualTransferLine />
        </div>
      </div>
    </div>
  );
}
