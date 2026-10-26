import type { CSSProperties, ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'dusk';

const TONES: Record<BadgeTone, [string, string]> = {
  neutral: ['var(--paper-2)', 'var(--ink-2)'],
  brand: ['var(--fox-100)', 'var(--fox-700)'],
  success: ['var(--sage-100)', 'var(--sage-700)'],
  warning: ['var(--saffron-100)', 'var(--saffron-700)'],
  danger: ['var(--danger-soft)', 'var(--danger)'],
  info: ['var(--sky-100)', 'var(--sky-700)'],
  dusk: ['var(--dusk-100)', 'var(--dusk-700)'],
};

export function Badge({ tone = 'neutral', dot, children, style }: { tone?: BadgeTone; dot?: boolean; children: ReactNode; style?: CSSProperties }) {
  const [bg, fg] = TONES[tone];
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, height: 22, padding: '0 9px', flex: 'none',
        borderRadius: 99, background: bg, color: fg, font: '500 12px/1 var(--font-body)',
        letterSpacing: '.02em', whiteSpace: 'nowrap', ...style,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: fg }} />}
      {children}
    </span>
  );
}

/** Read-only tag chip (dot + label). */
export function Tag({ color = 'var(--area-health)', children }: { color?: string; children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px',
        borderRadius: 99, border: '1px solid var(--border-default)', background: 'var(--surface-card)',
        color: 'var(--text-strong)', font: '400 13px/1 var(--font-body)',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      {children}
    </span>
  );
}

export function ProgressRing({ value = 0, size = 64, stroke = 6, color = 'var(--sage-500)', track = 'var(--paper-3)', children }: {
  value?: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <span style={{ position: 'relative', display: 'inline-grid', placeItems: 'center', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)}
          style={{ transition: 'stroke-dashoffset var(--dur-slow) var(--ease-out)' }}
        />
      </svg>
      <span style={{ position: 'relative', font: `500 ${Math.round(size * 0.24)}px/1 var(--font-mono)`, color: 'var(--text-strong)', textAlign: 'center' }}>
        {children ?? `${Math.round(v)}%`}
      </span>
    </span>
  );
}
