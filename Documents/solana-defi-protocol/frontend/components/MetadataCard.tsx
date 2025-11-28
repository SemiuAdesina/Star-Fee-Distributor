import type { RegistryMetadata } from "../lib/api";
import { FaFileAlt, FaLink, FaHashtag, FaCodeBranch } from "react-icons/fa";

type MetadataCardProps = {
  metadata: RegistryMetadata | null;
  loading: boolean;
  authority?: string | null;
};

export const MetadataCard = ({ metadata, loading, authority }: MetadataCardProps) => {
  const checksum = metadata?.metadataChecksum?.slice(0, 4).join(", ");

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
        background: 'linear-gradient(to right, rgba(59, 130, 246, 0), rgba(34, 211, 238, 0))',
        pointerEvents: 'none',
        borderRadius: '24px'
      }}></div>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            borderRadius: '12px',
            background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.4))',
            padding: '12px',
            border: '1px solid rgba(147, 197, 253, 0.4)',
            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.2)',
            flexShrink: 0
          }}>
            <FaFileAlt style={{ fontSize: '24px', color: '#93c5fd' }} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'rgba(147, 197, 253, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '4px' }}>Registry Metadata</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
              {metadata?.authority ?? authority ?? "No authority selected"}
            </p>
          </div>
        </div>
        {loading && <span style={{ fontSize: '12px', color: 'rgba(147, 197, 253, 0.8)' }}>Loading…</span>}
      </header>
      {metadata ? (
        <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '14px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <FaCodeBranch style={{ marginTop: '2px', color: '#60a5fa', flexShrink: 0, fontSize: '18px' }} />
            <div style={{ minWidth: 0 }}>
              <dt style={{ fontSize: '12px', color: 'rgba(96, 165, 250, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '8px' }}>Version</dt>
              <dd style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '18px' }}>{metadata.version}</dd>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <FaHashtag style={{ marginTop: '2px', color: '#c084fc', flexShrink: 0, fontSize: '18px' }} />
            <div style={{ minWidth: 0 }}>
              <dt style={{ fontSize: '12px', color: 'rgba(196, 181, 253, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '8px' }}>Checksum</dt>
              <dd style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '18px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{checksum ?? "—"}</dd>
            </div>
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <FaLink style={{ marginTop: '2px', color: '#34d399', flexShrink: 0, fontSize: '18px' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <dt style={{ fontSize: '12px', color: 'rgba(52, 211, 153, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '8px' }}>Metadata URI</dt>
              <dd style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 'bold', color: '#ffffff', fontSize: '18px' }}>
                {metadata.metadataUri ?? "Not published"}
              </dd>
            </div>
          </div>
        </dl>
      ) : (
        <div style={{ padding: '24px', borderRadius: '12px', backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          {authority ? (
            <>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
                No registry metadata found for this authority.
              </p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                The registry account may not exist on-chain yet, or metadata has not been published.
              </p>
            </>
          ) : (
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
              Connect a wallet or enter an authority to view registry information.
            </p>
          )}
        </div>
      )}
    </section>
  );
};
