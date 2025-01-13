import { useAuth0 } from "@auth0/auth0-react";
import Loader from "@components/Loader";
import { Outlet, useNavigate } from "react-router-dom";
// import AuthStateSyncer from "@components/AuthStateSyncer";
import { useEffect } from "react";

import "@rainbow-me/rainbowkit/styles.css";
import { polygonAmoy } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import {
  darkTheme,
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const config = getDefaultConfig({
  appName: "Fincube",
  projectId: `${import.meta.env.VITE_WALLET_CONNECT_ID}`,
  chains: [polygonAmoy],
});

const queryClient = new QueryClient();

export default function MfsLayout() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth0();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthLoading, isAuthenticated]);

  return (
    <div>
      {/* <AuthStateSyncer /> */}
      {isAuthLoading ? (
        <Loader />
      ) : (
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              theme={darkTheme({
                accentColor: "#7b3fe4",
                accentColorForeground: "white",
                borderRadius: "large",
                fontStack: "rounded",
                overlayBlur: "large",
              })}
            >
              <Outlet />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      )}
    </div>
  );
}
