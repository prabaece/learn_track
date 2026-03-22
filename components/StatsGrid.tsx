'use client'

// src/components/StatsGrid.tsx
// Responsive stat cards — auto-wraps on mobile

const F = "'DM Sans','Segoe UI',sans-serif"

interface StatItem {
  label:  string
  value:  string | number
  icon:   string
  color:  string
  border: string
  sub:    string
}

export function StatsGrid({ stats }: { stats: StatItem[] }) {
  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${stats.length}, minmax(120px, 1fr))`,
        gap: 14,
        marginBottom: 22,
      }}>
        {stats.map((s, i) => (
          <div key={i}
            style={{ background: 'var(--bg-card)', border: `1px solid ${s.border}`, borderRadius: 16, padding: '16px 18px', cursor: 'default', transition: 'transform .2s', fontFamily: F }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 11, margin: 0, fontWeight: 500 }}>{s.label}</p>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
            </div>
            <p style={{ color: s.color, fontSize: 26, fontWeight: 700, margin: '0 0 3px', lineHeight: 1 }}>{s.value}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: 0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .stats-auto-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 400px) {
          .stats-auto-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </>
  )
}
