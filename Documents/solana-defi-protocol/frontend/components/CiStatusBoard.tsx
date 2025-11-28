import type { CiStatus } from "../lib/api";
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaCodeBranch, FaUser, FaClock } from "react-icons/fa";

type CiStatusBoardProps = {
  statuses: CiStatus[];
  loading: boolean;
  error?: Error;
};

const statusColor: Record<string, string> = {
  success: "#34d399",
  failed: "#f87171",
  running: "#fbbf24"
};

const statusIcon: Record<string, React.ReactNode> = {
  success: <FaCheckCircle style={{ color: "#34d399" }} />,
  failed: <FaTimesCircle style={{ color: "#f87171" }} />,
  running: <FaSpinner style={{ animation: 'spin 1s linear infinite', color: "#fbbf24" }} />
};

export const CiStatusBoard = ({ statuses, loading, error }: CiStatusBoardProps) => {
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
        background: 'linear-gradient(to right, rgba(251, 191, 36, 0), rgba(249, 115, 22, 0))',
        pointerEvents: 'none',
        borderRadius: '24px'
      }}></div>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
        <div>
          <p style={{ fontSize: '12px', color: 'rgba(251, 191, 36, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '4px' }}>CI Status</p>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>Recent Runs</p>
        </div>
        {loading && <span style={{ fontSize: '12px', color: 'rgba(251, 191, 36, 0.8)' }}>Syncing…</span>}
      </header>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 10, listStyle: 'none', padding: 0, margin: 0 }}>
        {statuses.map((run) => (
          <li key={run.runId} style={{ borderRadius: '12px', backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>{run.pipeline}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '18px' }}>{statusIcon[run.status] ?? <FaSpinner style={{ color: '#94a3b8' }} />}</div>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', padding: '6px 12px', borderRadius: '8px', color: statusColor[run.status] ?? '#e2e8f0', backgroundColor: run.status === 'success' ? 'rgba(52, 211, 153, 0.2)' : run.status === 'failed' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(251, 191, 36, 0.2)' }}>
                  {run.status}
                </span>
              </div>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', fontFamily: 'monospace' }}>
              <FaCodeBranch style={{ color: '#60a5fa' }} />
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.commit}</p>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaUser style={{ color: '#c084fc' }} />
                <span style={{ fontWeight: 500 }}>{run.triggeredBy}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaClock style={{ color: '#22d3ee' }} />
                <span>{new Date(run.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </li>
        ))}
        {error && (
          <li style={{ fontSize: '14px', color: '#f87171', textAlign: 'center', padding: '24px', borderRadius: '12px', backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
            Error loading CI statuses: {error.message}
          </li>
        )}
        {!error && !statuses.length && (
          <li style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center', padding: '24px', borderRadius: '12px', backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            No CI runs recorded yet.
          </li>
        )}
      </ul>
    </section>
  );
};
