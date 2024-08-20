import { useAuth0 } from "@auth0/auth0-react";
import Loader from "@components/Loader";
import { Outlet, useNavigate } from "react-router-dom";
import AuthStateSyncer from "@components/AuthStateSyncer";
import { useEffect } from "react";

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

export default function MfsLayout() {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth0();

    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            navigate("/mfs/login");
        }
    }, [isAuthLoading, isAuthenticated]);

    return (
        <div>
            <AuthStateSyncer />
            {isAuthLoading ? (
                <Loader />
            ) : (
                <WagmiProvider config={config}>
                    <QueryClientProvider client={queryClient}>
                        <RainbowKitProvider>
                            <Outlet />
                        </RainbowKitProvider>
                    </QueryClientProvider>
                </WagmiProvider>
            )}
        </div>
    );
}
