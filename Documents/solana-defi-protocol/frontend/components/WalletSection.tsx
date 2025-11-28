"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { FaPaste } from "react-icons/fa";
import { SiSolana } from "react-icons/si";

type WalletSectionProps = {
  onAuthorityChange: (authority: string) => void;
};

export const WalletSection = ({ onAuthorityChange }: WalletSectionProps) => {
  const { publicKey } = useWallet();
  const [manualAuthority, setManualAuthority] = useState("");
  const lastPublicKeyRef = useRef<string | null>(null);
  const onAuthorityChangeRef = useRef(onAuthorityChange);

  // Keep the callback ref up to date
  useEffect(() => {
    onAuthorityChangeRef.current = onAuthorityChange;
  }, [onAuthorityChange]);

  // Update authority when wallet connects/disconnects or changes
  useLayoutEffect(() => {
    if (publicKey) {
      const address = publicKey.toBase58();
      if (lastPublicKeyRef.current !== address) {
        lastPublicKeyRef.current = address;
        onAuthorityChangeRef.current(address);
        setManualAuthority("");
      }
    } else {
      if (lastPublicKeyRef.current !== null) {
        lastPublicKeyRef.current = null;
      }
    }
  }, [publicKey]);

  const authorityDisplay = publicKey?.toBase58() ?? (manualAuthority || "Connect wallet");

  return (
    <section style={{ 
      position: 'relative', 
      overflow: 'hidden',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
      padding: '24px',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    }}>
      <div style={{ 
        position: 'absolute', 
        inset: 0,
        background: 'linear-gradient(to right, rgba(147, 51, 234, 0), rgba(59, 130, 246, 0))',
        pointerEvents: 'none',
        borderRadius: '24px'
      }}></div>
      <header style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              borderRadius: '12px',
              background: 'linear-gradient(to bottom right, rgba(147, 51, 234, 0.3), rgba(147, 51, 234, 0.4))',
              padding: '12px',
              border: '1px solid rgba(196, 181, 253, 0.4)',
              boxShadow: '0 10px 15px -3px rgba(147, 51, 234, 0.2)',
              flexShrink: 0
            }}>
              <SiSolana style={{ fontSize: '32px', color: '#c084fc' }} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'rgba(196, 181, 253, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '4px' }}>Authority</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{authorityDisplay}</p>
            </div>
          </div>
          <WalletMultiButton className="wallet-adapter-button-trigger" />
        </div>
        <div style={{ position: 'relative' }}>
          <FaPaste style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(196, 181, 253, 0.6)', fontSize: '14px', zIndex: 10 }} />
          <input
            type="text"
            placeholder="Or paste authority here"
            style={{ width: '100%', paddingLeft: '48px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', fontSize: '14px', color: '#ffffff', backgroundColor: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', outline: 'none' }}
            value={manualAuthority}
            onChange={(event) => {
              setManualAuthority(event.target.value);
              if (event.target.value.length >= 32) {
                onAuthorityChange(event.target.value);
              }
            }}
          />
        </div>
      </header>
    </section>
  );
};
