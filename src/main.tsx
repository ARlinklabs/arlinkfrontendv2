import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ArweaveWalletKit } from "arweave-wallet-kit";
import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <HelmetProvider>
            <ArweaveWalletKit
                config={{
                    permissions: [
                        "ACCESS_ADDRESS",
                        "ACCESS_PUBLIC_KEY",
                        "SIGN_TRANSACTION",
                        "DISPATCH",
                    ],
                    ensurePermissions: true,
                }}
                theme={{
                    displayTheme: "dark",
                }}
            >
                <App />
            </ArweaveWalletKit>
        </HelmetProvider>
    </React.StrictMode>,
);
