import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ArweaveWalletKit } from "@arweave-wallet-kit/react";
import WanderStrategy from "@arweave-wallet-kit/wander-strategy";
import OthentStrategy from "@arweave-wallet-kit/othent-strategy";
import BrowserWalletStrategy from "@arweave-wallet-kit/browser-wallet-strategy";
import WebWalletStrategy from "@arweave-wallet-kit/webwallet-strategy";
import AoSyncStrategy from "@vela-ventures/aosync-strategy";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostHogProvider } from 'posthog-js/react'


const options = {
    api_host: "https://us.i.posthog.com",
    // Enable session recording
    session_recording: {
      recordCanvas: true,
      recordCrossOriginIframes: false,
      recordNetworkPayload: false,
      recordResourceTimings: true,
      recordScreen: false,
      recordTextInputs: true,
      recordWindowSize: true,
    },
    // Enable automatic event capture
    autocapture: true,
    // Capture page views automatically
    capture_pageview: true,
    // Capture page leave events
    capture_pageleave: true,
  }

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
            <PostHogProvider apiKey="phc_WY4XjaGylQgKdnvlaEIFM179W36iLQrtHTHusc4P5KF" options={options}>

        <QueryClientProvider client={queryClient}>
            <ArweaveWalletKit
                theme={{
                    displayTheme: "dark",
                }}
                config={{
                    permissions: [
                        "ACCESS_ADDRESS",
                        "ACCESS_PUBLIC_KEY",
                        "SIGN_TRANSACTION",
                        "DISPATCH",
                    ],
                    ensurePermissions: true,
                    strategies: [
                        new WanderStrategy(),
                        new AoSyncStrategy(),
                        new OthentStrategy(),
                        new BrowserWalletStrategy(),
                        new WebWalletStrategy(),
                    ],
                }}
            >
                <App />
            </ArweaveWalletKit>
        </QueryClientProvider>
        </PostHogProvider>
    </React.StrictMode>
);
