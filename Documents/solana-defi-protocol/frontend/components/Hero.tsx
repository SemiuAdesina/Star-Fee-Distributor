"use client";

import { HiOutlineSparkles, HiOutlineShieldCheck } from "react-icons/hi";

export const Hero = () => {
  return (
    <section style={{ position: 'relative', width: '100%', paddingTop: '128px', paddingBottom: '96px', overflow: 'hidden' }}>
      {/* Animated background gradients */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '25%', width: '384px', height: '384px', background: 'rgba(147, 51, 234, 0.2)', borderRadius: '50%', filter: 'blur(96px)' }}></div>
        <div style={{ position: 'absolute', bottom: 0, right: '25%', width: '384px', height: '384px', background: 'rgba(37, 99, 235, 0.2)', borderRadius: '50%', filter: 'blur(96px)' }}></div>
      </div>
      
      <div style={{ position: 'relative', width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 16px', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '32px' }}>
          {/* Icon and Title */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #9333ea, #2563eb)', borderRadius: '24px', filter: 'blur(32px)', opacity: 0.5 }}></div>
              <div style={{ position: 'relative', borderRadius: '24px', background: 'linear-gradient(to bottom right, rgba(147, 51, 234, 0.4), rgba(37, 99, 235, 0.4))', padding: '24px', border: '1px solid rgba(147, 51, 234, 0.5)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', backdropFilter: 'blur(4px)' }}>
                <HiOutlineShieldCheck style={{ fontSize: '64px', color: '#e9d5ff' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.025em' }}>
                <span style={{ background: 'linear-gradient(to right, #c084fc, #93c5fd, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Audit Readiness
                </span>
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div style={{ borderRadius: '50%', background: 'linear-gradient(to right, rgba(147, 51, 234, 0.2), rgba(37, 99, 235, 0.2))', padding: '8px', border: '1px solid rgba(147, 51, 234, 0.3)' }}>
                  <HiOutlineSparkles style={{ fontSize: '20px', color: '#c084fc' }} />
                </div>
                <p style={{ fontSize: '20px', color: '#cbd5e1' }}>
                  Cohort III Subsidy Dashboard
                </p>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '896px', lineHeight: '1.75', padding: '0 16px' }}>
            Advanced wallet-aware dashboard for subsidy preparation, CI monitoring, and on-chain metadata governance
          </p>
        </div>
      </div>
    </section>
  );
};
