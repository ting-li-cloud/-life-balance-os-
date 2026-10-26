import { useEffect, useState } from 'react';
import { Button } from '../ds/Button';
import { Dialog, Input, Switch } from '../ds/Forms';
import { ESTIMATE_CHOICES, PROJECTS, TODAY, dayLabel, type ProjectKey, type Source, type WorkTask } from '../data/work';
import { ChoiceChips } from './ChoiceChips';

export type NewTask = Pick<WorkTask, 'title' | 'project' | 'due' | 'estimate' | 'source' | 'today'> & { from?: string };

const DUE_CHOICES = ['2026-10-26', '2026-10-27', '2026-10-30', '2026-11-02', '2026-11-09'];
const SOURCES: Source[] = ['自己排', '主管交辦', '臨時交辦', '例行'];

export function AddWorkDialog({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (t: NewTask) => void }) {
  const [title, setTitle] = useState('');
  const [project, setProject] = useState<ProjectKey>('finance');
  const [due, setDue] = useState(TODAY);
  const [estimate, setEstimate] = useState<string>('');
  const [source, setSource] = useState<Source>('自己排');
  const [today, setToday] = useState(true);

  // Start fresh each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setTitle(''); setProject('finance'); setDue(TODAY); setEstimate(''); setSource('自己排'); setToday(true);
  }, [open]);

  const field = { display: 'flex', flexDirection: 'column', gap: 6 } as const;
  const lbl = { font: 'var(--text-label)', color: 'var(--text-strong)' } as const;
  const ok = title.trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} title="新增工作" width={520}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!ok) return;
          onAdd({ title: title.trim(), project, due, estimate: estimate ? Number(estimate) : undefined, source, today: today || due === TODAY });
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <Input id="new-work-title" label="工作名稱" icon="briefcase" placeholder="例如：整理 11 月子公司費用預估" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        <div style={field}><span style={lbl}>專案</span>
          <ChoiceChips label="專案" items={(Object.keys(PROJECTS) as ProjectKey[]).map((k) => ({ value: k, label: PROJECTS[k] }))} value={project} onChange={setProject} />
        </div>
        <div style={field}><span style={lbl}>到期日</span>
          <ChoiceChips label="到期日" items={DUE_CHOICES.map((d) => ({ value: d, label: d === TODAY ? '今天' : dayLabel(d) }))} value={due} onChange={setDue} />
        </div>
        <div style={field}><span style={lbl}>預估工時</span>
          <ChoiceChips label="預估工時" items={[{ value: '', label: '還不確定' }, ...ESTIMATE_CHOICES.map((m) => ({ value: String(m), label: `${m} 分` }))]} value={estimate} onChange={setEstimate} />
        </div>
        <div style={field}><span style={lbl}>來源</span>
          <ChoiceChips label="來源" items={SOURCES.map((s) => ({ value: s, label: s }))} value={source} onChange={setSource} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: 'var(--paper-2)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, color: 'var(--ink-1)' }}>排進今天</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>會出現在今日總覽的工作待辦</div>
          </div>
          <Switch label="排進今天" checked={today || due === TODAY} onChange={setToday} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button type="submit" disabled={!ok}>新增</Button>
        </div>
      </form>
    </Dialog>
  );
}
