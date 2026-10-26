import { useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

const VARIANTS = {
  primary: { bg: 'var(--brand)', hover: 'var(--brand-strong)', fg: 'var(--text-on-brand)', bd: 'transparent' },
  secondary: { bg: 'var(--surface-card)', hover: 'var(--surface-hover)', fg: 'var(--text-strong)', bd: 'var(--border-default)' },
  soft: { bg: 'var(--saffron-100)', hover: 'var(--saffron-300)', fg: 'var(--ink-1)', bd: 'transparent' },
  ghost: { bg: 'transparent', hover: 'var(--surface-hover)', fg: 'var(--text-body)', bd: 'transparent' },
  danger: { bg: 'var(--danger)', hover: '#93361F', fg: '#FFFDF8', bd: 'transparent' },
};
const SIZES = {
  sm: { h: 32, px: 14, fs: 13, ic: 16 },
  md: { h: 40, px: 18, fs: 15, ic: 18 },
  lg: { h: 48, px: 24, fs: 16, ic: 20 },
};

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  icon?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

export function Button({ variant = 'primary', size = 'md', icon, iconRight, disabled, fullWidth, children, style, ...rest }: ButtonProps) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const v = VARIANTS[variant];
  const s = SIZES[size];
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      {...rest}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: s.h, padding: `0 ${s.px}px`, width: fullWidth ? '100%' : undefined,
        borderRadius: 'var(--radius-pill)', border: `1px solid ${v.bd}`,
        background: hover && !disabled ? v.hover : v.bg, color: v.fg,
        font: `500 ${s.fs}px/1 var(--font-body)`, letterSpacing: '.02em',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
        transform: press && !disabled ? 'scale(var(--press-scale))' : 'none',
        transition: 'background var(--dur-base) var(--ease-out),transform var(--dur-fast) var(--ease-out)',
        whiteSpace: 'nowrap', ...style,
      }}
    >
      {icon && <Icon name={icon} size={s.ic} />}
      {children}
      {iconRight && <Icon name={iconRight} size={s.ic} />}
    </button>
  );
}

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  icon: IconName;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  style?: CSSProperties;
}

/** Ghost icon button (the only variant the app uses). */
export function IconButton({ icon, label, size = 'md', disabled, style, ...rest }: IconButtonProps) {
  const [hover, setHover] = useState(false);
  const d = size === 'sm' ? 32 : size === 'lg' ? 48 : 40;
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...rest}
      style={{
        width: d, height: d, flex: 'none', display: 'inline-grid', placeItems: 'center',
        borderRadius: 'var(--radius-pill)', border: 0,
        background: hover ? 'var(--surface-hover)' : 'transparent', color: 'var(--text-body)',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
        transition: 'background var(--dur-base) var(--ease-out)', padding: 0, ...style,
      }}
    >
      <Icon name={icon} size={d * 0.48} />
    </button>
  );
}
