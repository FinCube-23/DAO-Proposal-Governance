import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMutation } from "@tanstack/react-query";
import { CircleChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount, useDisconnect } from "wagmi";
import { proxyApis } from "@/core/services/proxy";
import { userApis } from "@/core/services/user";
import { Button } from "@/shared/components/ui/button";

interface Props {
  incrementStep: () => void;
}

export default function StepWalletConnect({ incrementStep }: Props) {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const [isValidating, setIsValidating] = useState(false);

  const updateProfile = useMutation({
    mutationFn: userApis.updateProfile,
  });

  const checkIsMemberApproved = useMutation({
    mutationFn: proxyApis.checkIsMemberApproved,
  });

  const handleNext = async () => {
    if (!address || !isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsValidating(true);

    try {
      // Step 1: Call the backend to update user's wallet
      const updateResponse = await updateProfile.mutateAsync({
        wallet_address: address,
      });
      // Check if the response contains error messages
      if (
        updateResponse.wallet_address &&
        Array.isArray(updateResponse.wallet_address)
      ) {
        const errorMessage = updateResponse.wallet_address[0];
        disconnect();
        toast.error(errorMessage);
        return;
      }

      // Step 2: Check if member is approved on the smart contract
      const isMemberApproved = await checkIsMemberApproved.mutateAsync({
        address,
      });

      // Step 3: Apply the business logic based on requirements
      if (
        updateResponse.wallet_address &&
        updateResponse.wallet_address !== address
      ) {
        // Backend says wallet exists (different from current address) AND member is approved
        if (isMemberApproved) {
          disconnect();
          toast.error("Wallet already exists, please use another wallet");
          return;
        }
      } else if (!updateResponse.wallet_address && isMemberApproved) {
        // Backend says wallet does not exist but member is approved on contract
        disconnect();
        toast.error("Wallet already exists, please use another wallet");
        return;
      }

      // If we reach here, wallet update can proceed
      toast.success("Wallet connected successfully");
      incrementStep();
    } catch (error: any) {
      console.error(error);

      // Check if the error is a 400 bad request with wallet_address validation error
      if (error.status === 400 && error.data?.wallet_address) {
        const walletError = Array.isArray(error.data.wallet_address)
          ? error.data.wallet_address[0]
          : error.data.wallet_address;
        disconnect();
        toast.error(walletError);
      }
      // Check if the error is related to wallet existence (fallback)
      // Check for wallet existence error using structured error code or property
      else if (
        error.code === "WALLET_EXISTS" ||
        error.data?.code === "WALLET_EXISTS"
      ) {
        disconnect();
        toast.error("Wallet already exists, please use another wallet");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1 my-5">
      <div className="text-xl font-bold">Step 1: Connect Your Wallet</div>
      <div className="text-center text-muted-foreground">
        Please connect your wallet to continue.
      </div>
      <div className="my-3"></div>
      <div className="">
        <ConnectButton />
      </div>
      <div className="flex justify-end w-full">
        <Button
          disabled={!isConnected || isValidating}
          onClick={handleNext}
          isLoading={isValidating}
        >
          {isValidating ? "Validating..." : "Next"}
          {!isValidating && (
            <>
              <CircleChevronRight />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
