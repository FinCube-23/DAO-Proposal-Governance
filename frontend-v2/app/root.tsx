import type { Route } from './+types/root'
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'
import { Toaster } from './shared/components/ui/sonner'
import './app.css'
import Header from './shared/components/layout/header'
import { createConfig, http, injected, WagmiProvider } from 'wagmi'
import { polygonAmoy, sepolia } from "viem/chains";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";

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

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-screen">
        {children}
        <Toaster richColors />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
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
          <Header />
          <Outlet />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details
      = error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details
  }
  else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
