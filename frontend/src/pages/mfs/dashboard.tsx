import { AnnualTransferLine } from "@components/mfs/AnnualTransferLine";
import DisplayCard from "@components/mfs/DisplayCard";
import { ExchangeRatePie } from "@components/mfs/ExchangeRatePie";
import { LiquidityRatioBar } from "@components/mfs/LiquidityRatioBar";
import contractABI from "../../contractABI/contractABI.json";
import StableCoinABI from "../../contractABI/StableCoinABI.json";
import { config } from "@layouts/RootLayout";
import metamask from "../../../src/assets/metamask.svg";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { RootState } from "@redux/store";
import { useSelector } from "react-redux";
import { useAccount, useConnect, useWalletClient } from "wagmi";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import {
  useLazyGetBalanceQuery,
  useLazyGetProposalCountQuery,
  useLazyGetProposalThresholdQuery,
} from "@redux/services/proxy";
import { getChainId, readContract } from "@wagmi/core";
import WalletAuth from "@components/auth/WalletAuth";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Plus } from "lucide-react";

// Updated token configuration
export const tokenConfig = {
  usdc: {
    // Mainnets
    1: {
      // Ethereum
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
      image: "https://etherscan.io/token/images/centre-usdc_28.png",
    },
    137: {
      // Polygon POS
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      decimals: 6,
      image: "https://polygonscan.com/token/images/centre-usdc_28.png",
    },
    10: {
      // Optimism
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      decimals: 6,
      image: "https://optimistic.etherscan.io/token/images/centre-usdc_28.png",
    },

    // Testnets
    80002: {
      // Polygon Amoy (testnet)
      address: "0x2a0dD4b621e65B093EaA794C1a7F259eE0dA9456", // Replace with actual test token address
      decimals: 6,
      image: "https://amoy.polygonscan.com/token/images/centre-usdc_28.png",
    },
    // Add other testnets as needed
  },
};

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
  const chainId = getChainId(config);
  const { data: client } = useWalletClient();

  const handleAddToken = async () => {
    const tokenInfo =
      tokenConfig.usdc[chainId as keyof typeof tokenConfig.usdc];

    try {
      const success = await client?.watchAsset({
        type: "ERC20",
        options: {
          address: tokenInfo.address,
          symbol: "USDC",
          decimals: tokenInfo.decimals,
          image: tokenInfo.image,
        },
      });

      if (success) {
        toast.success("Token added successfully");
      }
    } catch (e) {
      console.error(e);
    }
  };

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
    (state: RootState) => state.persistedReducer.authReducer
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
            <CardDescription>
              {auth?.profile?.mfsBusiness?.name}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      <div className="flex justify-end relative">
        <div className="absolute top-8 right-8 flex items-center gap-2">
          {address && !isMemberApproved ? (
            <div className="font-bold text-sm">
              Membership Status: <Badge variant="warning">Pending</Badge>
            </div>
          ) : address && isMemberApproved ? (
            <p className="mr-2 border-2 border-green-600 font-bold p-2 rounded-2xl text-xs">
              Approved
            </p>
          ) : (
            <></>
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
              actionButton={
                <Button
                  title="Add to Metamask"
                  className="my-2"
                  onClick={handleAddToken}
                  variant="outline"
                  disabled={
                    !chainId ||
                    !tokenConfig.usdc[chainId as keyof typeof tokenConfig.usdc]
                  }
                >
                  <Plus size={15} color="skyblue" />
                  <img src={metamask} alt="metamask" className="w-5" />
                </Button>
              }
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
