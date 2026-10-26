/** Single-choice pill chips (filters, quick picks). Styled like the design system's selectable Tag. */
export function ChoiceChips<T extends string>({ items, value, onChange, label }: {
  items: { value: T; label: string }[];
  /** null = nothing selected (a one-shot quick pick). */
  value: T | null;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {items.map((it) => {
        const on = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            role="radio"
            aria-checked={on}
            className="chip"
            onClick={() => onChange(it.value)}
            style={{
              height: 30, padding: '0 12px', borderRadius: 99, cursor: 'pointer',
              border: `1px solid ${on ? 'var(--sky-500)' : 'var(--border-default)'}`,
              background: on ? 'var(--sky-100)' : 'var(--surface-card)',
              color: on ? 'var(--ink-1)' : 'var(--ink-2)', font: `${on ? 500 : 400} 13px/1 var(--font-body)`,
              transition: 'all var(--dur-base) var(--ease-out)', whiteSpace: 'nowrap',
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
