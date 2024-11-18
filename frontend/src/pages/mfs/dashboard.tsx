import { AnnualTransferLine } from "@components/mfs/AnnualTransferLine";
import DisplayCard from "@components/mfs/DisplayCard";
import { ExchangeRatePie } from "@components/mfs/ExchangeRatePie";
import { LiquidityRatioBar } from "@components/mfs/LiquidityRatioBar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { RootState } from "@redux/store";
import { useSelector } from "react-redux";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useConnect } from "wagmi";
import { useEffect } from "react";
import { toast, Toaster } from "sonner";
import {
  useLazyGetProposalCountQuery,
  useLazyGetProposalThresholdQuery,
} from "@redux/services/proxy";

export default function MfsDashboard() {
  const { address } = useAccount();
  const { connectors } = useConnect();
  const [getProposalThreshold] = useLazyGetProposalThresholdQuery();
  const [getProposalCount] = useLazyGetProposalCountQuery();
  // const [proposalCount, setProposalCount] = useState(0);
  // const [proposalThreshold, setProposalThreshold] = useState(0);

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
        // setProposalCount(response);
        console.log(response);
      } catch (e) {
        console.error(e);
      }
    };

    // getProposalThreshold
    const fetchProposalThreshold = async () => {
      try {
        const response = await getProposalThreshold();
        // setProposalThreshold(response);
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

  return (
    <div className="border min-h-96 rounded-xl mt-10 pb-10">
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
            <DisplayCard title="Total Number of Proposals" value="10" />
          </div>
          <div>
            <DisplayCard title="Proposal Threshold" value="10" />
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
