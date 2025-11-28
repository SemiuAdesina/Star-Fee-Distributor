"use client";

export const SectionDivider = () => {
  return (
    <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}></div>
        </div>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <div style={{ borderRadius: '50%', background: 'linear-gradient(to right, rgba(147, 51, 234, 0.2), rgba(37, 99, 235, 0.2))', padding: '6px', border: '1px solid rgba(147, 51, 234, 0.2)' }}>
            <div style={{ height: '8px', width: '8px', borderRadius: '50%', background: 'linear-gradient(to right, #c084fc, #60a5fa)' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
