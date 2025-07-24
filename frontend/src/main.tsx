import React from "react";
import ReactDOM from "react-dom/client";
import "./global.css";
import { Provider } from "react-redux";
import { store } from "@redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "@redux/store";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Welcome from "@pages/welcome";
import RootLayout from "@layouts/RootLayout";
import Login from "@pages/login";
import Register from "@pages/register";
import MfsLayout from "@layouts/MfsLayout";
import MfsDashboard from "@pages/mfs/dashboard";
import DaoDashboard from "@pages/dao_dashboard";
import OffchainCardView from "@pages/dao/proposal/OffChainCardView";
import OngoingProposalView from "@pages/dao/proposal/OngoingProposalView";
import ProposalView from "@pages/dao/proposal/proposalView";
import GeneralProposal from "@pages/generalProposal";
import NewMemberApprovalProposal from "@pages/newMemberApprovalProposal";

import "@rainbow-me/rainbowkit/styles.css";
import { createConfig, http, WagmiProvider } from "wagmi";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@components/ui/sonner";
import { polygonAmoy, sepolia } from "viem/chains";
import { injected } from "@wagmi/core";
import AdminLayout from "@layouts/AdminLayout";
import AdminDashboard from "@pages/admin/AdminDashboard";
import MFSDetails from "@pages/admin/MFSDetails";
import TrxDetails from "@pages/admin/TrxDetails";
import UserList from "@components/mfs/UserList"; // or the correct path

export const config = createConfig({
  chains: [sepolia, polygonAmoy],
  connectors: [injected()],
  ssr: true,
  transports: {
    [sepolia.id]: http(`${import.meta.env.VITE_SEPOLIA_RPC}`),
    [polygonAmoy.id]: http(`${import.meta.env.VITE_AMOY_RPC}`),
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
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
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <Toaster richColors />
              <BrowserRouter>
                <Routes>
                  <Route element={<RootLayout />}>
                    <Route index element={<Welcome />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                  </Route>
                  <Route path="organization" element={<MfsLayout />}>
                    <Route
                      path=""
                      element={<Navigate to="/organization/dashboard" />}
                    />
                    <Route path="dashboard" element={<MfsDashboard />} />
                    <Route path="dashboard/users" element={<UserList />} />
                    <Route path="dao">
                      <Route
                        path=""
                        element={<Navigate to="/organization/dao/fincube" />}
                      />
                      <Route path="fincube">
                        <Route path="" element={<DaoDashboard />} />
                        <Route
                          path="general-proposal"
                          element={<GeneralProposal />}
                        />
                        <Route
                          path="approval-proposal"
                          element={<NewMemberApprovalProposal />}
                        />
                        <Route path="proposals" element={<DaoDashboard />} />
                        <Route
                          path="off-chain-proposals"
                          element={<DaoDashboard />}
                        />
                        <Route
                          path={`off-chain-proposals/:id/transaction`}
                          element={<TrxDetails />}
                        />
                        <Route
                          path="ongoing-proposals"
                          element={<DaoDashboard />}
                        />
                        <Route
                          path="proposals/:id"
                          element={<ProposalView />}
                        />
                        <Route
                          path="off-chain-proposals/:id"
                          element={<OffchainCardView />}
                        />
                        <Route
                          path="ongoing-proposals/:id"
                          element={<OngoingProposalView />}
                        />
                      </Route>
                    </Route>
                  </Route>
                  <Route path="admin" element={<AdminLayout />}>
                    <Route
                      path=""
                      element={<Navigate to="/admin/dashboard" />}
                    />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route
                      path="dashboard/organizations"
                      element={<AdminDashboard />}
                    />
                    <Route
                      path="dashboard/transactions"
                      element={<AdminDashboard />}
                    />
                    <Route
                      path="dashboard/organizations/:id"
                      element={<MFSDetails />}
                    />
                    <Route
                      path="dashboard/transactions/:id"
                      element={<TrxDetails />}
                    ></Route>
                  </Route>
                </Routes>
              </BrowserRouter>
            </PersistGate>
          </Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
