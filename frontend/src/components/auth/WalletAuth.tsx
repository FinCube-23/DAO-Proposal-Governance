import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const WalletAuth = () => {
  const { isConnected } = useAccount();

  return (
    <>
      {!isConnected && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-black p-20 rounded-xl shadow-lg border border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
            <p>Please connect your wallet to continue.</p>
            <div className="mt-4 flex justify-center">
              <ConnectButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletAuth;
