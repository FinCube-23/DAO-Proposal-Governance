import { AnnualTransferLine } from "@components/mfs/AnnualTransferLine";
import DisplayCard from "@components/mfs/DisplayCard";
import { ExchangeRatePie } from "@components/mfs/ExchangeRatePie";
import { LiquidityRatioBar } from "@components/mfs/LiquidityRatioBar";
import contractABI from "../../contractABI/contractABI.json";
import StableCoinABI from "../../contractABI/StableCoinABI.json";
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
  useLazyGetBalanceQuery,
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
  const [getBalance] = useLazyGetBalanceQuery();
  const [proposalCount, setProposalCount] = useState("");
  const [proposalThreshold, setProposalThreshold] = useState("");
  const [isMemberApproved, setIsMemberApproved] = useState(false);
  const [coinBalance, setCoinBalance] = useState(0);

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
        const response: any = await readContract(config, {
          abi: contractABI,
          address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
          functionName: "proposalCount",
        });
        const result = response.toString();

        console.log(result);
        setProposalCount(result);
      } catch (e) {
        console.error(e);
      }
    };

    // fetchUSDCBalance
    const getUSDCBalance = async () => {
      try {
        const response: any = await readContract(config, {
          abi: StableCoinABI,
          address: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
          functionName: "balanceOf",
          args: [address],
        });
        const result = response.toString();
        console.log("USDC Balance:", result);
        setCoinBalance(result);
      } catch (e) {
        console.error(e);
      }
    };

    const fetchProposalThreshold = async () => {
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
          functionName: "proposalThreshold",
        });
        const result = response.toString();

        console.log(result);
        setProposalThreshold(result);
      } catch (e) {
        console.error(e);
      }
    };

    fetchProposalCount();
    fetchProposalThreshold();
    getUSDCBalance();
  }, [getProposalCount, getProposalThreshold, getBalance, address]);

  const auth = useSelector(
    (state: RootState) => state.persistedReducer.authReducer.auth
  );

  useEffect(() => {
    const checkIsMemberApproved = async () => {
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
          functionName: "checkIsMemberApproved",
          args: [address],
        });

        console.log(response);
        setIsMemberApproved(true);
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
        <div className="absolute top-8 right-8 flex items-center">
          {!isMemberApproved ? (
            <p className="mr-2 border-2 border-red-600 font-bold p-2 rounded-2xl text-xs">
              Not approved
            </p>
          ) : (
            <p className="mr-2 border-2 border-green-600 font-bold p-2 rounded-2xl text-xs">
              Approved
            </p>
          )}
          <ConnectButton />
        </div>
      </div>
      <div className="flex flex-col gap-8 pt-28 px-8">
        <div className="flex gap-8 justify-center">
          <div>
            <DisplayCard
              title="USDC Balance"
              value={`${coinBalance} USDC`}
              dataSource="On-chain"
            />
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
              dataSource="On-chain"
            />
          </div>
          <div>
            <DisplayCard
              title="Proposal Threshold"
              value={proposalThreshold}
              dataSource="On-chain"
            />
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
