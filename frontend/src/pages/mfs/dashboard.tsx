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

export default function MfsDashboard() {
  const { address } = useAccount();
  const { connectors } = useConnect();

  useEffect(() => {
    if (address) {
      toast.success("Wallet connected!");
    } else if (!connectors) {
      toast.error("Failed to connect wallet");
    }
  }, [address, connectors]);

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
          <div className="border rounded-xl p-8 flex flex-col items-center justify-center">
            <h2 className="text-lg">Token Liquidity</h2>
            <p className="text-2xl font-bold">0.7m USDT</p>
          </div>
          <div className="">
            <div className="w-64">
              <ExchangeRatePie />
            </div>
          </div>
          <div>
            <DisplayCard title="Total Number of Customers" value={269} />
          </div>
          <div>
            <DisplayCard title="Annual Transfer Amount" value="1,000k BDT" />
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
