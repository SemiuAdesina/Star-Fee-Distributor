"use client";

import { SiSolana } from "react-icons/si";
import { BsBoxSeam } from "react-icons/bs";

export const Header = () => {
  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, width: '100%', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(24px)' }}>
      <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #9333ea, #2563eb)', borderRadius: '12px', filter: 'blur(16px)', opacity: 0.5 }}></div>
              <div style={{ position: 'relative', borderRadius: '12px', background: 'linear-gradient(to bottom right, rgba(147, 51, 234, 0.3), rgba(37, 99, 235, 0.3))', padding: '12px', border: '1px solid rgba(147, 51, 234, 0.4)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <BsBoxSeam style={{ fontSize: '24px', color: '#c084fc' }} />
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', background: 'linear-gradient(to right, #c084fc, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Solana DeFi Protocol
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>Cohort III</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', background: 'linear-gradient(to right, rgba(88, 28, 135, 0.3), rgba(30, 58, 138, 0.3))', border: '1px solid rgba(147, 51, 234, 0.2)', backdropFilter: 'blur(4px)' }}>
              <SiSolana style={{ fontSize: '18px', color: '#c084fc' }} />
              <span style={{ fontSize: '14px', color: '#e2e8f0' }}>Testnet</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
