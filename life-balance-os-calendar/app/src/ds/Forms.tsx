import { useEffect, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { IconButton } from './Button';

export function Checkbox({ checked, onChange, label, description, color = 'var(--sage-500)' }: {
  checked: boolean; onChange: (next: boolean) => void; label: ReactNode; description?: ReactNode; color?: string;
}) {
  return (
    <label
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={(e) => { e.preventDefault(); onChange(!checked); }}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!checked); } }}
      style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}
    >
      <span
        style={{
          width: 22, height: 22, flex: 'none', marginTop: 1, display: 'grid', placeItems: 'center', borderRadius: 7,
          border: `1.5px solid ${checked ? color : 'var(--line-2)'}`, background: checked ? color : 'var(--surface-card)',
          transition: 'all var(--dur-base) var(--ease-out)', boxSizing: 'border-box',
        }}
      >
        {checked && <Icon name="check" size={15} color="#FFFDF8" />}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          style={{
            font: '400 15px/1.5 var(--font-body)', color: checked ? 'var(--text-muted)' : 'var(--text-strong)',
            textDecoration: checked ? 'line-through' : 'none', textDecorationColor: 'var(--ink-4)',
          }}
        >
          {label}
        </span>
        {description && <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>{description}</span>}
      </span>
    </label>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 26, borderRadius: 99, border: 0, padding: 0, flex: 'none', cursor: 'pointer',
        background: checked ? 'var(--sage-500)' : 'var(--paper-3)', position: 'relative',
        transition: 'background var(--dur-base) var(--ease-out)',
      }}
    >
      <span
        style={{
          position: 'absolute', top: 3, left: checked ? 21 : 3, width: 20, height: 20, borderRadius: '50%',
          background: '#FFFDF8', boxShadow: 'var(--shadow-1)', transition: 'left var(--dur-base) var(--ease-out)',
        }}
      />
    </button>
  );
}

export function Input({ label, icon, ...rest }: { label?: string; icon?: IconName } & Omit<InputHTMLAttributes<HTMLInputElement>, 'style'>) {
  const [focus, setFocus] = useState(false);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, font: 'var(--text-label)', color: 'var(--text-strong)' }}>
      {label && <span>{label}</span>}
      <span
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', minHeight: 42,
          background: 'var(--surface-card)', border: `1px solid ${focus ? 'var(--ink-2)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-sm)', boxShadow: focus ? '0 0 0 3px var(--sky-100)' : 'var(--shadow-inset)',
          transition: 'all var(--dur-base) var(--ease-out)',
        }}
      >
        {icon && <Icon name={icon} size={18} color="var(--text-muted)" />}
        <input
          {...rest}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent',
            font: '400 15px/1.6 var(--font-body)', color: 'var(--text-strong)', padding: 0,
          }}
        />
      </span>
    </label>
  );
}

export function Tabs<T extends string>({ items, value, onChange }: { items: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" style={{ display: 'inline-flex', gap: 4, padding: 4, background: 'var(--surface-sunken)', borderRadius: 99 }}>
      {items.map((it) => {
        const on = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(it.value)}
            style={{
              height: 34, padding: '0 16px', border: 0, borderRadius: 99,
              background: on ? 'var(--surface-card)' : 'transparent', boxShadow: on ? 'var(--shadow-1)' : 'none',
              color: on ? 'var(--text-strong)' : 'var(--text-muted)', font: `${on ? 500 : 400} 14px var(--font-body)`,
              cursor: 'pointer', transition: 'all var(--dur-base) var(--ease-out)',
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

export function Dialog({ open, onClose, title, width = 440, children }: {
  open: boolean; onClose: () => void; title: string; width?: number; children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'var(--scrim)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 100 }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width, maxWidth: 'calc(100vw - 32px)', boxSizing: 'border-box', background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-3)', padding: 24,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ font: 'var(--text-h2)', color: 'var(--text-strong)' }}>{title}</div>
          <IconButton icon="x" label="關閉" size="sm" onClick={onClose} style={{ marginTop: -2, marginRight: -6 }} />
        </div>
        <div style={{ color: 'var(--text-body)' }}>{children}</div>
      </div>
    </div>
  );
}
