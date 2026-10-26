import { useCallback, useState } from 'react';
import { Button } from './ds/Button';
import { Tabs } from './ds/Forms';
import { Icon } from './ds/Icon';
import { FOCUS_POOL, HEADER, HEADER_TITLE, INITIAL_WEEK_DONE, NAV, PERIOD_VIEWS, type Scenario, type ViewKey } from './data/sample';
import { INITIAL_WAITING, TODAY, bucketOf, initialTasks, parseEstimate, type WaitingItem, type WorkTask } from './data/work';
import { WorkView, type WorkActions } from './views/WorkView';
import { CalendarView } from './views/CalendarView';
import { TodayView, type HeroImage } from './views/TodayView';
import { MonthView, WeekView, YearView, type WeekDone } from './views/PeriodViews';
import { GoalsView } from './views/GoalsView';
import { RescheduleDialog } from './components/RescheduleDialog';

/**
 * Startup options (the prototype's Tweaks panel), read from the URL:
 *   ?view=today|week|month|year|goals|work|calendar  &scenario=overload|normal|nodata  &hero=botanical|fox  &work=3..8
 */
function readOptions() {
  const q = new URLSearchParams(window.location.search);
  const pick = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
    const v = q.get(key) as T | null;
    return v && allowed.includes(v) ? v : fallback;
  };
  const work = Number(q.get('work'));
  // A bare #week / #goals etc. also picks the opening view (for shareable links).
  const hash = window.location.hash.slice(1);
  if (VIEWS.includes(hash as ViewKey)) q.set('view', hash);
  return {
    startView: pick<ViewKey>('view', VIEWS, 'today'),
    scenario: pick<Scenario>('scenario', ['overload', 'normal', 'nodata'], 'overload'),
    heroImage: pick<HeroImage>('hero', ['botanical', 'fox'], 'botanical'),
    workCount: Number.isInteger(work) && work >= 3 && work <= 8 ? work : 5,
  };
}

const VIEWS: readonly ViewKey[] = ['today', 'week', 'month', 'year', 'goals', 'work', 'calendar'];

const PERIOD_TABS: { value: ViewKey; label: string }[] = [
  { value: 'today', label: '今日' }, { value: 'week', label: '本週' }, { value: 'month', label: '本月' }, { value: 'year', label: '今年' },
];

export function App() {
  const [options] = useState(readOptions);
  const [view, setView] = useState<ViewKey>(options.startView);
  const [focusPick, setFocusPick] = useState([0, 1, 2]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [weekDone, setWeekDone] = useState<WeekDone>(INITIAL_WEEK_DONE);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  // Work data shared by 今日總覽 and 工作管理.
  const [tasks, setTasks] = useState<WorkTask[]>(() => initialTasks(options.scenario));
  const [waiting, setWaiting] = useState<WaitingItem[]>(INITIAL_WAITING);

  const patchTask = (id: string, fn: (t: WorkTask) => Partial<WorkTask>) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...fn(t) } : t)));
  const work: WorkActions = {
    toggleDone: (id) => patchTask(id, (t) => ({ done: !t.done })),
    toggleToday: (id) => patchTask(id, (t) => ({ today: !t.today })),
    setEstimate: (id, minutes) => patchTask(id, () => ({ estimate: minutes })),
    addTask: (t) => setTasks((ts) => [...ts, { ...t, id: `n${Date.now()}`, note: t.from ? `${t.from}交辦` : t.source, done: false }]),
    follow: (id) => setWaiting((ws) => ws.map((w) => (w.id === id ? { ...w, followed: true } : w))),
  };

  // Applying the reschedule resolves an overloaded day; filling in today's estimates resolves 資料尚不足.
  const todayMissing = tasks.some((t) => t.today && !t.done && t.estimate === undefined);
  const scenario: Scenario =
    applied && options.scenario === 'overload' ? 'normal' : options.scenario === 'nodata' && !todayMissing ? 'normal' : options.scenario;
  const focus = focusPick.map((i) => FOCUS_POOL[i]);

  /** Replace one 今日重點 slot with the next pool item not already shown. */
  const swapFocus = (slot: number) =>
    setFocusPick((used) => {
      let next = used[slot];
      do next = (next + 1) % FOCUS_POOL.length; while (used.includes(next));
      return used.map((v, i) => (i === slot ? next : v));
    });

  const firstFocus = focus[0].title.replace('完成', '').replace(/^天意能創 /, '');
  const openToday = tasks.filter((t) => !t.done && bucketOf(t) === 'today').length;
  const openWaiting = waiting.filter((w) => !w.followed).length;
  const title =
    view === 'today' ? `早安。今天先做「${firstFocus}」。`
    : view === 'work' ? `今天還有 ${openToday} 件工作，${openWaiting} 件在等別人。`
    : HEADER_TITLE[view];
  const go = (v: ViewKey) => { setView(v); window.scrollTo({ top: 0 }); };
  const closeDialog = useCallback(() => setDialogOpen(false), []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--paper-1)' }}>
      <Sidebar view={view} onNavigate={go} />

      <main style={{ flex: 1, minWidth: 0 }}>
        <header style={{ position: 'sticky', top: 'env(safe-area-inset-top, 0px)', zIndex: 5, background: 'var(--paper-1)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="page-gutter" style={{ maxWidth: 1120, margin: '0 auto', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ font: 'var(--text-label)', color: 'var(--ink-3)', letterSpacing: '.08em' }}>{HEADER[view]}</div>
              <h1 style={{ margin: 0, font: '400 24px/1.3 var(--font-display)', color: 'var(--ink-1)' }}>{title}</h1>
            </div>
            <Button icon="shuffle" onClick={() => setDialogOpen(true)}>重新安排今日</Button>
          </div>
          {PERIOD_VIEWS.includes(view) && (
            <div className="page-gutter" style={{ maxWidth: 1120, margin: '0 auto', padding: '0 32px 14px', overflowX: 'auto' }}>
              <Tabs items={PERIOD_TABS} value={view} onChange={setView} />
            </div>
          )}
        </header>

        <div className="page-gutter" style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 32px 48px', boxSizing: 'border-box' }}>
          {view === 'today' && (
            <TodayView
              scenario={scenario} applied={applied} focus={focus} onSwapFocus={swapFocus}
              onOpenReschedule={() => setDialogOpen(true)} heroImage={options.heroImage} workCount={options.workCount}
              tasks={tasks} waiting={waiting} onToggleTask={work.toggleDone} onFollow={work.follow} onOpenWork={() => go('work')} onOpenCalendar={() => go('calendar')}
              checks={checks} onToggleCheck={(k) => setChecks((c) => ({ ...c, [k]: !c[k] }))}
            />
          )}
          {view === 'week' && <WeekView weekDone={weekDone} onToggleAction={(k) => setWeekDone((d) => ({ ...d, [k]: !d[k] }))} />}
          {view === 'month' && <MonthView />}
          {view === 'year' && <YearView />}
          {view === 'goals' && <GoalsView weekDone={weekDone} />}
          {view === 'calendar' && <CalendarView />}
          {view === 'work' && <WorkView tasks={tasks} waiting={waiting} {...work} />}
        </div>
      </main>

      <RescheduleDialog open={dialogOpen} onClose={closeDialog} onApply={(adHoc) => {
          // A typed 臨時交辦 becomes a real task on today's list.
          if (adHoc) work.addTask({ title: adHoc, project: 'finance', due: TODAY, estimate: parseEstimate(adHoc), source: '臨時交辦', today: true });
          setApplied(true);
          setDialogOpen(false);
        }} />
    </div>
  );
}

function Sidebar({ view, onNavigate }: { view: ViewKey; onNavigate: (v: ViewKey) => void }) {
  return (
    <aside
      className="sidebar"
      style={{
        width: 240, flex: 'none', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 24, boxSizing: 'border-box',
        borderRight: '1px solid var(--border-subtle)', background: 'var(--paper-1)', position: 'sticky', top: 0, height: '100vh',
      }}
    >
      <div style={{ padding: '0 10px' }}>
        <div style={{ font: '700 20px var(--font-display)', color: 'var(--ink-1)' }}>Life Balance OS</div>
        <div style={{ font: '400 12px var(--font-display)', color: 'var(--ink-3)', marginTop: 2 }}>工作與生活整合管理系統</div>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((n, i) => {
          // 今日總覽 stays highlighted for every period view (今日/本週/本月/今年).
          const on = n.view === 'today' ? PERIOD_VIEWS.includes(view) : n.view === view;
          return (
            <button
              key={n.label}
              type="button"
              className="nav-item"
              aria-current={on ? 'page' : undefined}
              onClick={() => n.view && onNavigate(n.view)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, height: 40, padding: '0 12px', borderRadius: 12, border: 0, textAlign: 'left',
                background: on ? 'var(--paper-0)' : 'transparent', boxShadow: on ? 'var(--shadow-1)' : 'none',
                color: on ? 'var(--ink-1)' : 'var(--ink-2)', font: `${on ? 500 : 400} 14px var(--font-body)`, cursor: 'pointer',
              }}
            >
              <Icon name={n.icon} size={18} color={on ? 'var(--brand)' : 'var(--ink-3)'} />
              <span style={{ flex: 1 }}>{n.label}</span>
              <span style={{ font: '400 11px var(--font-mono)', color: 'var(--ink-4)' }}>{String(i + 1).padStart(2, '0')}</span>
            </button>
          );
        })}
      </nav>
      <div style={{ marginTop: 'auto', padding: 16, borderRadius: 16, background: 'var(--saffron-100)' }}>
        <div style={{ font: '400 17px/1.45 var(--font-hand)', color: 'var(--ink-1)' }}>不用每件都做完，<br />先做最重要的那一件。</div>
      </div>
    </aside>
  );
}
