import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { AoWalletProvider } from "ao-wallet-kit";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostHogProvider } from 'posthog-js/react'


const options = {
    api_host: "https://us.i.posthog.com",
    session_recording: {
      recordCanvas: true,
      recordCrossOriginIframes: false,
      recordNetworkPayload: false,
      recordResourceTimings: true,
      recordScreen: false,
      recordTextInputs: true,
      recordWindowSize: true,
    },
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
  }

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <PostHogProvider apiKey="phc_WY4XjaGylQgKdnvlaEIFM179W36iLQrtHTHusc4P5KF" options={options}>
            <QueryClientProvider client={queryClient}>
                <AoWalletProvider
                    autoConnect={true}
                    theme={{ displayTheme: "dark" }}
                    permissions={[
                        "ACCESS_ADDRESS",
                        "ACCESS_PUBLIC_KEY",
                        "SIGN_TRANSACTION",
                        "DISPATCH",
                    ]}
                >
                    <App />
                </AoWalletProvider>
            </QueryClientProvider>
        </PostHogProvider>
    </React.StrictMode>
);
