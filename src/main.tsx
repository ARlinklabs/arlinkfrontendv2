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


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
   
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
        </React.StrictMode>
    
);
