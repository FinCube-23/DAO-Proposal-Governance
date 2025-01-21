import { Button } from "@components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect } from "react";
import { useAccount } from "wagmi";

interface Props {
    current: number;
    incrementStep: () => void;
}

export default function ConnectWalletStep({ current, incrementStep }: Props) {
    const { isConnected } = useAccount();
    
    return (
        <div className="flex flex-col items-start gap-1 my-5">
            <div className="text-xl font-bold">Step 1: Connect Your Wallet</div>
            <div className="text-center text-muted-foreground">
                Please connect your wallet to continue.
            </div>
            <div className="my-3"></div>
            <div className=""><ConnectButton /></div>
            <div className="flex justify-end w-full">
                <Button disabled={!isConnected} onClick={incrementStep}>
                    Next
                </Button>
            </div>
        </div>
    );
}
