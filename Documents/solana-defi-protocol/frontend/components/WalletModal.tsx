"use client";

import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import type { WalletName } from "@solana/wallet-adapter-base";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

export const WalletModal = () => {
  const { visible, setVisible } = useWalletModal();
  const { wallets, select } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !visible) {
    return null;
  }

  const handleWalletSelect = (walletName: WalletName) => {
    select(walletName);
    setVisible(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setVisible(false);
        }
      }}
    >
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(147, 51, 234, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: 0,
          maxWidth: '400px',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))',
            pointerEvents: 'none',
            borderRadius: '24px',
            zIndex: 0
          }}
        />

        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
          }}
        >
          <FaTimes style={{ width: '20px', height: '20px' }} />
        </button>

        {/* Title */}
        <div
          style={{
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: 700,
            padding: '24px 24px 16px 24px',
            margin: 0,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            zIndex: 1,
            background: 'transparent'
          }}
        >
          Select Wallet
        </div>

        {/* Wallet List */}
        <ul
          style={{
            margin: 0,
            padding: '16px',
            listStyle: 'none',
            position: 'relative',
            zIndex: 1
          }}
        >
          {wallets.map((wallet) => (
            <li
              key={wallet.adapter.name}
              style={{
                margin: '0 0 8px 0',
                padding: 0
              }}
            >
              <button
                onClick={() => handleWalletSelect(wallet.adapter.name as WalletName)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  position: 'relative',
                  overflow: 'hidden',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(147, 51, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {wallet.adapter.icon && (
                  <img
                    src={wallet.adapter.icon}
                    alt={wallet.adapter.name}
                    style={{
                      width: '24px',
                      height: '24px',
                      flexShrink: 0
                    }}
                  />
                )}
                <span>{wallet.adapter.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

