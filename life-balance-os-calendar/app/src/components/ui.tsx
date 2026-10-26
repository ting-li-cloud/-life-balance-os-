import type { CSSProperties, ReactNode } from 'react';

/** Paper card: paper-0 fill, subtle border, shadow-1, 20px radius. */
export function Card({ children, style, as: Tag = 'section' }: { children: ReactNode; style?: CSSProperties; as?: 'section' | 'div' }) {
  return (
    <Tag
      style={{
        minWidth: 0, background: 'var(--paper-0)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-1)',
        borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', boxSizing: 'border-box', ...style,
      }}
    >
      {children}
    </Tag>
  );
}

export function H3({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <h3 style={{ margin: 0, font: 'var(--text-h3)', color: 'var(--ink-1)', ...style }}>{children}</h3>;
}

/** Card header row: title + optional trailing content. */
export function CardHead({ title, children, align = 'baseline', style }: { title: ReactNode; children?: ReactNode; align?: 'baseline' | 'center'; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: align, gap: 10, flexWrap: 'wrap', ...style }}>
      <H3 style={{ flex: 1 }}>{title}</H3>
      {children}
    </div>
  );
}

export const Muted = ({ children, size = 13 }: { children: ReactNode; size?: number }) => (
  <span style={{ fontSize: size, color: 'var(--ink-3)' }}>{children}</span>
);

/** Big mono number with a small unit, e.g. "10.5 h". */
export function Stat({ label, value, unit = 'h', color = 'var(--ink-1)' }: { label: string; value: ReactNode; unit?: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{label}</div>
      <div style={{ font: '500 26px/1.2 var(--font-mono)', color }}>
        {value}
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}> {unit}</span>
      </div>
    </div>
  );
}

export function Dot({ color, size = 8, radius = 99 }: { color: string; size?: number; radius?: number }) {
  return <span style={{ width: size, height: size, flex: 'none', borderRadius: radius, background: color, display: 'inline-block' }} />;
}

export function LegendItem({ color, children, swatch = 'square' }: { color: string; children: ReactNode; swatch?: 'square' | 'dot' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <Dot color={color} radius={swatch === 'dot' ? 99 : 3} />
      {children}
    </span>
  );
}

/** Soft pigment pill used for categories (生活待辦 kind, area labels). */
export function SoftPill({ bg, children }: { bg: string; children: ReactNode }) {
  return (
    <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 10px', borderRadius: 999, background: bg, fontSize: 12, color: 'var(--ink-1)', lineHeight: 1.7 }}>
      {children}
    </span>
  );
}

export function ProgressBar({ pct, color, track = 'var(--paper-2)', style }: { pct: number; color: string; track?: string; style?: CSSProperties }) {
  return (
    <div style={{ height: 6, borderRadius: 999, background: track, overflow: 'hidden', ...style }}>
      <span style={{ display: 'block', height: '100%', width: `${pct}%`, background: color }} />
    </div>
  );
}

/** Row separated from the previous one by a hairline. */
export function Row({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ borderTop: '1px solid var(--border-subtle)', ...style }}>{children}</div>;
}

export const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap });
export const wrapRow = (gap: number, align: CSSProperties['alignItems'] = 'stretch'): CSSProperties => ({ display: 'flex', flexWrap: 'wrap', gap, alignItems: align });
