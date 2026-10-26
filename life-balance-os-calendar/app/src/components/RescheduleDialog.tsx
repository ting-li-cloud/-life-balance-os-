import { useState } from 'react';
import { Button } from '../ds/Button';
import { Dialog, Input, Switch } from '../ds/Forms';
import { RESCHEDULE_SUGGESTIONS } from '../data/sample';

/** 重新安排今日: log an ad-hoc assignment and pick which suggested changes to apply. */
export function RescheduleDialog({ open, onClose, onApply }: { open: boolean; onClose: () => void; onApply: (adHoc: string) => void }) {
  const [enabled, setEnabled] = useState<boolean[]>(RESCHEDULE_SUGGESTIONS.map(() => true));
  const [adHoc, setAdHoc] = useState('');

  return (
    <Dialog open={open} onClose={onClose} title="重新安排今日" width={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Input label="有臨時交辦嗎？" icon="inbox" placeholder="例如：董事長要現金流週報，約 60 分鐘" value={adHoc} onChange={(e) => setAdHoc(e.target.value)} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ font: 'var(--text-label)', color: 'var(--ink-2)' }}>建議調整 · 可省下 1.5 小時</div>
          {RESCHEDULE_SUGGESTIONS.map((s, i) => (
            <div key={s.title} style={{ padding: '12px 14px', borderRadius: 14, background: 'var(--paper-2)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, color: 'var(--ink-1)' }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{s.meta}</div>
              </div>
              <Switch label={s.title} checked={enabled[i]} onChange={(v) => setEnabled((e) => e.map((x, j) => (j === i ? v : x)))} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="secondary" onClick={onClose}>稍後再說</Button>
          <Button onClick={() => { onApply(adHoc.trim()); setAdHoc(''); }}>套用</Button>
        </div>
      </div>
    </Dialog>
  );
}
