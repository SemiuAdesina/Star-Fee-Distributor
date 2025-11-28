"use client";

import { SiSolana } from "react-icons/si";
import { BsBoxSeam } from "react-icons/bs";
import { FaGithub, FaBook, FaCode } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer style={{ position: 'relative', width: '100%', marginTop: '96px' }}>
      {/* Curved SVG Wave */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '64px', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 64L60 58C120 52 240 40 360 34C480 28 600 28 720 31C840 34 960 40 1080 43C1200 46 1320 46 1380 46L1440 46V64H1380C1320 64 1200 64 1080 64C960 64 840 64 720 64C600 64 480 64 360 64C240 64 120 64 60 64H0Z" fill="#000000"/>
        </svg>
      </div>
      
      <div style={{ position: 'relative', backgroundColor: '#000000', paddingTop: '80px', paddingBottom: '48px', width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '48px', marginBottom: '48px' }}>
            {/* Brand Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #9333ea, #2563eb)', borderRadius: '8px', filter: 'blur(8px)', opacity: 0.5 }}></div>
                  <div style={{ position: 'relative', borderRadius: '8px', background: 'linear-gradient(to bottom right, rgba(147, 51, 234, 0.3), rgba(37, 99, 235, 0.3))', padding: '10px', border: '1px solid rgba(147, 51, 234, 0.4)' }}>
                    <BsBoxSeam style={{ fontSize: '20px', color: '#c084fc' }} />
                  </div>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>Solana DeFi</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.75' }}>
                Advanced protocol for decentralized finance on Solana blockchain. Built for security, scalability, and transparency.
              </p>
            </div>
            
            {/* Resources Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resources</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0, margin: 0 }}>
                <li>
                  <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#94a3b8', textDecoration: 'none' }}>
                    <FaBook style={{ fontSize: '12px' }} />
                    <span>Documentation</span>
                  </a>
                </li>
                <li>
                  <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#94a3b8', textDecoration: 'none' }}>
                    <FaCode style={{ fontSize: '12px' }} />
                    <span>API Reference</span>
                  </a>
                </li>
                <li>
                  <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#94a3b8', textDecoration: 'none' }}>
                    <FaGithub style={{ fontSize: '12px' }} />
                    <span>GitHub Repository</span>
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Network Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Network</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: 'linear-gradient(to right, rgba(88, 28, 135, 0.2), rgba(30, 58, 138, 0.2))', border: '1px solid rgba(147, 51, 234, 0.2)', backdropFilter: 'blur(4px)' }}>
                <SiSolana style={{ fontSize: '24px', color: '#c084fc' }} />
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Solana Testnet</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>Local Development</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
                © 2024 Solana DeFi Protocol. All rights reserved.
              </p>
              <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
                Cohort III Subsidy Dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
