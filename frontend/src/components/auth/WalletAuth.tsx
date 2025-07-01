import { ConnectButton } from "@rainbow-me/rainbowkit";

const WalletAuth = () => {
  return (
    <>
      {false && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-background p-20 rounded-xl shadow-lg border">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Wallet Not Connected
            </h2>
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
