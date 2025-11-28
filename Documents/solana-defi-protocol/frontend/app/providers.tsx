"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./wallet-adapter.css";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import type { WalletAdapter } from "@solana/wallet-adapter-base";
import { useMemo } from "react";
import { WalletModal } from "../components/WalletModal";

type ProvidersProps = {
  children: React.ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC ?? "http://localhost:8899";
  const wallets = useMemo<WalletAdapter[]>(() => {
    const phantom = new PhantomWalletAdapter();
    return [phantom as WalletAdapter];
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletModal />
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

