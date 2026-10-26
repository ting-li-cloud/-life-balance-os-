import { useState } from 'react';
import { Badge } from '../ds/Display';
import { Button } from '../ds/Button';
import { Checkbox, Tabs } from '../ds/Forms';
import { Icon } from '../ds/Icon';
import {
  ESTIMATE_CHOICES, PROJECTS, SOURCE_TONE, bucketOf, dayLabel, dueBadge, hoursLabel, minutesLabel, waitingMeta,
  TODAY, type Bucket, type ProjectKey, type WaitingItem, type WorkTask,
} from '../data/work';
import { Card, CardHead, H3, Muted, Row, Stat, stack, wrapRow } from '../components/ui';
import { ChoiceChips } from '../components/ChoiceChips';
import { AddWorkDialog, type NewTask } from '../components/AddWorkDialog';

export interface WorkActions {
  toggleDone: (id: string) => void;
  toggleToday: (id: string) => void;
  setEstimate: (id: string, minutes: number) => void;
  addTask: (t: NewTask) => void;
  follow: (id: string) => void;
}

interface Props extends WorkActions {
  tasks: WorkTask[];
  waiting: WaitingItem[];
  /** Bucket to open on (e.g. 補上工時 from the home page opens 今天). */
  initialBucket?: Bucket;
}

const BUCKETS: { value: Bucket; label: string }[] = [
  { value: 'today', label: '今天' }, { value: 'week', label: '本週' }, { value: 'later', label: '之後' }, { value: 'done', label: '已完成' },
];
type ProjectFilter = ProjectKey | 'all';
const PROJECT_FILTERS: { value: ProjectFilter; label: string }[] = [
  { value: 'all', label: '全部' }, { value: 'finance', label: PROJECTS.finance }, { value: 'sales', label: PROJECTS.sales },
];

const sumMinutes = (ts: WorkTask[]) => ts.reduce((n, t) => n + (t.estimate ?? 0), 0);

export function WorkView({ tasks, waiting, initialBucket = 'today', ...actions }: Props) {
  const [bucket, setBucket] = useState<Bucket>(initialBucket);
  const [project, setProject] = useState<ProjectFilter>('all');
  const [adding, setAdding] = useState(false);

  const inProject = tasks.filter((t) => project === 'all' || t.project === project);
  const count = (b: Bucket) => inProject.filter((t) => bucketOf(t) === b).length;
  const shown = inProject
    .filter((t) => bucketOf(t) === bucket)
    .sort((a, b) => (bucket === 'done' ? b.due.localeCompare(a.due) : a.due.localeCompare(b.due)));
  const groups = shown.reduce<Map<string, WorkTask[]>>((m, t) => m.set(t.due, [...(m.get(t.due) ?? []), t]), new Map());
  const missingShown = shown.filter((t) => t.estimate === undefined).length;

  const open = tasks.filter((t) => !t.done);
  const todayTasks = open.filter((t) => bucketOf(t) === 'today');
  const weekTasks = open.filter((t) => bucketOf(t) !== 'later');
  const missing = open.filter((t) => t.estimate === undefined).sort((a, b) => a.due.localeCompare(b.due));

  return (
    <div style={wrapRow(20, 'flex-start')}>
      {/* 工作清單 */}
      <Card style={{ flex: '1.7 1 520px', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Icon name="briefcase" size={20} color="var(--sky-500)" />
          <H3 style={{ flex: 1 }}>工作清單</H3>
          <Button size="sm" icon="plus" onClick={() => setAdding(true)}>新增工作</Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <Tabs items={BUCKETS.map((b) => ({ value: b.value, label: `${b.label} ${count(b.value)}` }))} value={bucket} onChange={setBucket} />
          </div>
          <ChoiceChips items={PROJECT_FILTERS} value={project} onChange={setProject} label="專案" />
        </div>
        {bucket !== 'done' && shown.length > 0 && (
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            {shown.length} 件 · 預估 <b style={{ font: '500 13px var(--font-mono)', color: 'var(--ink-1)' }}>{hoursLabel(sumMinutes(shown))}</b> 小時
            {missingShown > 0 && <span style={{ color: 'var(--saffron-700)' }}> · {missingShown} 件未填工時</span>}
          </div>
        )}

        {shown.length === 0 ? (
          <div style={{ padding: '28px 18px', borderRadius: 14, background: 'var(--paper-2)', textAlign: 'center', color: 'var(--ink-2)', fontSize: 14 }}>
            {bucket === 'done' ? '還沒有完成的工作。' : '這裡沒有工作。'}
          </div>
        ) : (
          <div style={stack(4)}>
            {[...groups].map(([due, ts]) => (
              <div key={due} style={stack(0)}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '10px 0 6px' }}>
                  <span style={{ font: '500 13px var(--font-mono)', color: due === TODAY ? 'var(--fox-700)' : 'var(--ink-2)' }}>{dayLabel(due)}</span>
                  {due === TODAY && <span style={{ fontSize: 12, color: 'var(--fox-700)' }}>今天到期</span>}
                  {due < TODAY && bucket !== 'done' && <span style={{ fontSize: 12, color: 'var(--danger)' }}>已逾期</span>}
                </div>
                {ts.map((t) => <TaskRow key={t.id} t={t} {...actions} />)}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div style={{ flex: '1 1 300px', minWidth: 0, ...stack(20) }}>
        {/* 工時 */}
        <Card style={{ gap: 14 }}>
          <CardHead title="預估工時" align="center"><Muted>未完成的工作</Muted></CardHead>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
            <Stat label={`今天 · ${todayTasks.length} 件`} value={hoursLabel(sumMinutes(todayTasks))} />
            <Stat label={`本週 · ${weekTasks.length} 件`} value={hoursLabel(sumMinutes(weekTasks))} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>今天可用 9.0 小時，含會議與固定行程。</div>
        </Card>

        {/* 補上工時 */}
        <Card style={{ gap: 6 }}>
          <CardHead title="補上工時" align="center" style={{ marginBottom: 6 }}>
            {missing.length > 0 && <Badge tone="warning">{missing.length} 件</Badge>}
          </CardHead>
          {missing.length === 0 ? (
            <div style={{ fontSize: 14, color: 'var(--ink-2)', padding: '4px 0 2px' }}>工時都填好了，首頁可以算出今天塞不塞得下。</div>
          ) : (
            <>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 4 }}>選一個大概的時間就好，之後可以再改。</div>
              {missing.map((t) => (
                <Row key={t.id} style={{ ...stack(8), padding: '12px 0' }}>
                  <div>
                    <div style={{ fontSize: 15, color: 'var(--ink-1)' }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{dayLabel(t.due)} 到期{bucketOf(t) === 'today' ? ' · 今天要做' : ''}</div>
                  </div>
                  <ChoiceChips
                    label={`${t.title} 預估工時`}
                    items={ESTIMATE_CHOICES.map((m) => ({ value: String(m), label: `${m} 分` }))}
                    value={null}
                    onChange={(m) => actions.setEstimate(t.id, Number(m))}
                  />
                </Row>
              ))}
            </>
          )}
        </Card>

        {/* 等待他人 */}
        <Card style={{ gap: 8 }}>
          <CardHead title="等待他人" align="center" style={{ marginBottom: 4 }}>
            <Muted>{waiting.filter((w) => !w.followed).length} 件待追蹤</Muted>
          </CardHead>
          {waiting.map((w) => <WaitingRow key={w.id} w={w} onFollow={() => actions.follow(w.id)} showToday />)}
        </Card>
      </div>

      <AddWorkDialog open={adding} onClose={() => setAdding(false)} onAdd={(t) => { actions.addTask(t); setAdding(false); setBucket(t.today || t.due <= TODAY ? 'today' : 'week'); }} />
    </div>
  );
}

function TaskRow({ t, toggleDone, toggleToday }: { t: WorkTask } & WorkActions) {
  const due = dueBadge(t);
  const tone = SOURCE_TONE[t.source];
  const desc = [PROJECTS[t.project], minutesLabel(t.estimate), t.from ? `${t.from}交辦` : t.source].join(' · ');
  return (
    <Row style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 0', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
        <Checkbox checked={t.done} onChange={() => toggleDone(t.id)} label={t.title} description={desc} color="var(--sky-500)" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', marginLeft: 'auto' }}>
        {tone && <Badge tone={tone}>{t.source === '臨時交辦' ? '臨時' : t.source}</Badge>}
        {due && <Badge tone={due.tone}>{due.label}</Badge>}
        {!t.done && t.due !== TODAY && (
          <Button
            size="sm"
            variant="ghost"
            icon={t.today ? undefined : 'plus'}
            title={t.today ? '從今日總覽的工作待辦移出' : '加到今日總覽的工作待辦'}
            onClick={() => toggleToday(t.id)}
            style={t.today ? { color: 'var(--ink-3)' } : undefined}
          >
            {t.today ? '移出今天' : '排進今天'}
          </Button>
        )}
      </div>
    </Row>
  );
}

/** One 等待他人 row; shared with 今日總覽. */
export function WaitingRow({ w, onFollow, showToday }: { w: WaitingItem; onFollow: () => void; showToday?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 14, background: 'var(--paper-2)' }}>
      <span style={{ width: 30, height: 30, flex: 'none', borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--sky-100)', font: '500 13px var(--font-body)', color: 'var(--sky-700)' }}>{w.initial}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: 'var(--ink-1)', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {w.who}：{w.what}
          {showToday && w.followToday && !w.followed && <Badge tone="brand">今天追蹤</Badge>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{waitingMeta(w)}</div>
      </div>
      {w.followed ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 14px', fontSize: 13, color: 'var(--sage-700)', flex: 'none' }}>
          <Icon name="check" size={16} color="var(--sage-700)" />已追蹤
        </span>
      ) : (
        <Button size="sm" variant="ghost" icon="send" onClick={onFollow}>追蹤</Button>
      )}
    </div>
  );
}

