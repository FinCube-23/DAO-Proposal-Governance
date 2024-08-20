import AuthStateSyncer from "@components/AuthStateSyncer";
import Header from "@components/Header";
import { Outlet } from "react-router-dom";

import "@rainbow-me/rainbowkit/styles.css";
import { sepolia } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const config = getDefaultConfig({
    appName: "FinCube",
    projectId: `${import.meta.env.VITE_WALLET_CONNECT_ID}`,
    chains: [sepolia],
});

const queryClient = new QueryClient();

export default function RootLayout() {
    return (
        <>
            <div>
                <AuthStateSyncer />
                <Header />
                <WagmiProvider config={config}>
                    <QueryClientProvider client={queryClient}>
                        <RainbowKitProvider>
                            <Outlet />
                        </RainbowKitProvider>
                    </QueryClientProvider>
                </WagmiProvider>
            </div>
        </>
    );
}
