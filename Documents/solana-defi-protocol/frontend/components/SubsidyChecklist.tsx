import type { CiStatus, RegistryMetadata } from "../lib/api";
import { FaCheckCircle, FaCircle, FaFileAlt, FaCheck, FaProjectDiagram } from "react-icons/fa";

const readinessItems = [
  {
    title: "Registry Metadata Published",
    description: "Ensure registry metadata URI and checksum are set on-chain.",
    icon: <FaFileAlt />
  },
  {
    title: "CI Passing",
    description: "Latest pipeline must succeed with lint + tests + coverage.",
    icon: <FaCheck />
  },
  {
    title: "GraphQL Integration",
    description: "Expose metadata & CI status via /graphql for reviewers.",
    icon: <FaProjectDiagram />
  }
] as const;

type SubsidyChecklistProps = {
  metadata: RegistryMetadata | null;
  statuses: CiStatus[];
};

export const SubsidyChecklist = ({ metadata, statuses }: SubsidyChecklistProps) => {
  const latestStatus = statuses[0];

  const completed = {
    metadata: Boolean(metadata?.metadataUri),
    ci: latestStatus?.status === "success",
    graphql: true
  };

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
        background: 'linear-gradient(to right, rgba(52, 211, 153, 0), rgba(20, 184, 166, 0))',
        pointerEvents: 'none',
        borderRadius: '24px'
      }}></div>
      <header style={{ marginBottom: '24px', position: 'relative', zIndex: 10 }}>
        <p style={{ fontSize: '12px', color: 'rgba(52, 211, 153, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '4px' }}>Subsidy Checklist</p>
        <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>Audit-Ready Requirements</p>
      </header>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 10, listStyle: 'none', padding: 0, margin: 0 }}>
        {readinessItems.map((item) => {
          const key = item.title.split(" ")[0].toLowerCase() as keyof typeof completed;
          const done = completed[key];
          return (
            <li key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', borderRadius: '12px', border: done ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: done ? 'rgba(52, 211, 153, 0.2)' : 'rgba(0, 0, 0, 0.4)' }}>
              {done ? (
                <FaCheckCircle style={{ marginTop: '2px', color: '#6ee7b7', flexShrink: 0, fontSize: '20px' }} />
              ) : (
                <FaCircle style={{ marginTop: '2px', color: '#64748b', flexShrink: 0, fontSize: '20px' }} />
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                <span style={{ marginTop: '2px', fontSize: '18px', color: done ? '#6ee7b7' : '#64748b' }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', marginBottom: '4px' }}>{item.title}</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.75' }}>{item.description}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
