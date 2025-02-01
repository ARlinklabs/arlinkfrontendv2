import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { AOWalletKit } from "@project-kardeshev/ao-wallet-kit";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AOWalletKit
      config={{
        permissions: [
          "ACCESS_ADDRESS",
          "ACCESS_PUBLIC_KEY",
          "SIGN_TRANSACTION",
         
        ],
        ensurePermissions: true,
      }}
      theme={{
        displayTheme: "light"
      }}
    >
      
        <App />
      
    </AOWalletKit>
    </React.StrictMode>
  );