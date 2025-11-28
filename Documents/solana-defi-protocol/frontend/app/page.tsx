"use client";

import { useCallback, useState } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { FaCodeBranch, FaChevronDown, FaChevronUp } from "react-icons/fa";

import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Footer } from "../components/Footer";
import { SectionDivider } from "../components/SectionDivider";
import { MetadataCard } from "../components/MetadataCard";
import { CiStatusBoard } from "../components/CiStatusBoard";
import { fetchMetadata, fetchCiStatuses, type RegistryMetadata } from "../lib/api";
import { SubsidyChecklist } from "../components/SubsidyChecklist";

const GraphExplorer = dynamic(() => import("../components/GraphExplorer"), {
  ssr: false,
  loading: () => <div>Loading GraphQL explorer…</div>
});

const WalletSection = dynamic(() => import("../components/WalletSection").then(mod => ({ default: mod.WalletSection })), {
  ssr: false,
  loading: () => <div>Loading wallet section…</div>
});

export default function HomePage() {
  const [authority, setAuthority] = useState<string | null>(null);
  const [isGraphQLExpanded, setIsGraphQLExpanded] = useState(true);

  type MetadataKey = ["metadata", string];
  const metadataKey = authority ? (["metadata", authority] as MetadataKey) : null;
  const { data: metadata, isLoading: metadataLoading } = useSWR<
    RegistryMetadata | null,
    Error,
    MetadataKey | null
  >(metadataKey, async ([, currentAuthority]) => fetchMetadata(currentAuthority));
  const { data: statuses, isLoading: statusesLoading, error: statusesError } = useSWR("ci", fetchCiStatuses, {
    refreshInterval: 60_000
  });

  const handleAuthorityChange = useCallback((nextAuthority: string) => {
    setAuthority(nextAuthority);
  }, []);

  return (
    <div style={{ width: '100%', margin: 0, padding: 0, minHeight: '100vh', backgroundColor: '#000000', position: 'relative' }}>
      <Header />
      
      <div style={{ width: '100%', paddingTop: '80px' }}>
        <Hero />
        <SectionDivider />

        {/* Main Content */}
        <main style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 16px 48px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {/* First Row: Wallet & Checklist */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', width: '100%' }}>
            <div style={{ width: '100%' }}>
              <WalletSection onAuthorityChange={handleAuthorityChange} />
            </div>
            <div style={{ width: '100%' }}>
              <SubsidyChecklist metadata={metadata ?? null} statuses={statuses ?? []} />
            </div>
          </div>

          <SectionDivider />

          {/* Second Row: Metadata & CI Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', width: '100%' }}>
            <div style={{ width: '100%' }}>
              <MetadataCard metadata={metadata ?? null} loading={metadataLoading} authority={authority} />
            </div>
            <div style={{ width: '100%' }}>
              <CiStatusBoard statuses={statuses ?? []} loading={statusesLoading} error={statusesError} />
            </div>
          </div>

          <SectionDivider />

          {/* GraphQL Explorer */}
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
            <header style={{ marginBottom: '24px', position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      borderRadius: '12px',
                      background: 'linear-gradient(to bottom right, rgba(147, 51, 234, 0.3), rgba(147, 51, 234, 0.4))',
                      padding: '12px',
                      border: '1px solid rgba(196, 181, 253, 0.4)',
                      boxShadow: '0 10px 15px -3px rgba(147, 51, 234, 0.2)',
                      flexShrink: 0
                    }}>
                      <FaCodeBranch style={{ fontSize: '24px', color: '#c084fc' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', color: 'rgba(196, 181, 253, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '4px' }}>GraphQL Explorer</p>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>Query registry metadata & CI status</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsGraphQLExpanded(!isGraphQLExpanded)}
                    style={{ 
                      position: 'relative', 
                      zIndex: 20,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'rgba(147, 51, 234, 0.2)',
                      border: '1px solid rgba(147, 51, 234, 0.3)',
                      color: '#c084fc',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(147, 51, 234, 0.3)';
                      e.currentTarget.style.borderColor = 'rgba(196, 181, 253, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(147, 51, 234, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)';
                    }}
                  >
                    {isGraphQLExpanded ? (
                      <>
                        <FaChevronUp style={{ fontSize: '12px' }} />
                        Hide
                      </>
                    ) : (
                      <>
                        <FaChevronDown style={{ fontSize: '12px' }} />
                        Show
                      </>
                    )}
                  </button>
                </div>
              </div>
              {isGraphQLExpanded && (
                <div style={{ 
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(147, 51, 234, 0.1)',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  backdropFilter: 'blur(4px)'
                }}>
                  <p style={{ fontSize: '14px', color: 'rgba(221, 214, 254, 0.9)', lineHeight: '1.75' }}>
                    <strong style={{ color: '#c084fc' }}>What is this?</strong> This GraphQL explorer allows auditors and reviewers to directly query your registry metadata and CI status data. 
                    It's useful for programmatic access, testing, and integration with external tools. Click the play button (▶) to execute queries and explore the API.
                  </p>
                </div>
              )}
            </header>
            {isGraphQLExpanded && (
              <div style={{ position: 'relative', zIndex: 20, width: '100%', pointerEvents: 'auto' }}>
                <GraphExplorer />
              </div>
            )}
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
