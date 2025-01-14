import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import "@rainbow-me/rainbowkit/styles.css";
import { polygonAmoy } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";

export const config = getDefaultConfig({
    appName: "Fincube",
    projectId: `${import.meta.env.VITE_WALLET_CONNECT_ID}`,
    chains: [polygonAmoy],
});

const queryClient = new QueryClient();

export default function MfsLayout() {
    const navigate = useNavigate();
    const authStoreState = useSelector(
        (state: RootState) => state.persistedReducer.authReducer
    );

    useEffect(() => {
        if (!authStoreState.access && authStoreState.profile?.role != "mfs") {
            navigate("/");
        }
    }, [authStoreState]);

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    <Outlet />
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
