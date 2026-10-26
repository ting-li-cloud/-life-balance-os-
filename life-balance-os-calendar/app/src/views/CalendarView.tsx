import { useMemo, useState, type CSSProperties } from 'react';
import { Badge } from '../ds/Display';
import { Button, IconButton } from '../ds/Button';
import { Dialog, Tabs } from '../ds/Forms';
import { Icon } from '../ds/Icon';
import {
  DASHBOARD_URL, GOOGLE_CALENDAR, SOURCES, SOURCE_BY_ID, WD, addDays, dayKey, findConflicts, hm, md, mergeEvents, onDay,
  startOfDay, startOfMonth, startOfWeek, timeLabel, type CalEvent, type SourceId,
} from '../data/calendar';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { ACCESS_CODES, accessMessage } from '../lib/claudeMcp';
import { Card, CardHead, H3, Muted, Row, stack, wrapRow } from '../components/ui';

type CalView = 'day' | 'week' | 'month' | 'list';
const VIEWS: { value: CalView; label: string }[] = [
  { value: 'day', label: '日' }, { value: 'week', label: '週' }, { value: 'month', label: '月' }, { value: 'list', label: '清單' },
];
const LIST_DAYS = 14;

/** The days a view shows: [from, to). */
function rangeOf(view: CalView, anchor: Date): [Date, Date] {
  if (view === 'day') return [startOfDay(anchor), addDays(anchor, 1)];
  if (view === 'week') { const s = startOfWeek(anchor); return [s, addDays(s, 7)]; }
  if (view === 'month') { const m = startOfMonth(anchor); return [startOfWeek(m), addDays(startOfWeek(new Date(m.getFullYear(), m.getMonth() + 1, 0)), 7)]; }
  return [startOfDay(anchor), addDays(anchor, LIST_DAYS)];
}

function rangeLabel(view: CalView, anchor: Date) {
  if (view === 'day') return `${anchor.getMonth() + 1} 月 ${anchor.getDate()} 日 · 週${WD[anchor.getDay()]}`;
  if (view === 'month') return `${anchor.getFullYear()} 年 ${anchor.getMonth() + 1} 月`;
  const [a, b] = rangeOf(view, anchor);
  return `${md(a)} – ${md(addDays(b, -1))}`;
}

export function CalendarView() {
  const today = startOfDay(new Date());
  const [view, setView] = useState<CalView>('week');
  const [anchor, setAnchor] = useState(today);
  const [hidden, setHidden] = useState<Set<SourceId>>(new Set());
  const [open, setOpen] = useState<CalEvent | null>(null);

  // Load a whole month around the anchor at a time, so moving week to week rarely refetches.
  const month = startOfMonth(anchor);
  const loadFrom = startOfWeek(month);
  const loadTo = addDays(new Date(month.getFullYear(), month.getMonth() + 1, 1), 21);
  const { mode, states, refresh } = useCalendarEvents(loadFrom, loadTo);

  const all = useMemo(() => mergeEvents(Object.fromEntries(SOURCES.map((s) => [s.id, states[s.id]?.events ?? []]))), [states]);
  const visible = all.filter((e) => e.sources.some((s) => !hidden.has(s)));
  const [from, to] = rangeOf(view, anchor);
  const inRange = visible.filter((e) => e.start < to && e.end > from);
  const conflicts = findConflicts(inRange);
  const conflictKeys = new Set(conflicts.flatMap((c) => [c.a.key, c.b.key]));

  const errs = SOURCES.map((s) => states[s.id]?.error).filter(Boolean);
  const accessErr = errs.length === SOURCES.length && errs.every((e) => ACCESS_CODES.has(e!.code)) ? errs[0] : undefined;
  const loading = mode === 'checking' || SOURCES.some((s) => states[s.id]?.status === 'loading');
  const lastAt = Math.max(0, ...SOURCES.map((s) => states[s.id]?.at ?? 0));

  const step = (dir: 1 | -1) => setAnchor((a) =>
    view === 'day' ? addDays(a, dir) : view === 'week' ? addDays(a, 7 * dir) : view === 'list' ? addDays(a, LIST_DAYS * dir) : new Date(a.getFullYear(), a.getMonth() + dir, 1));
  const openDay = (d: Date) => { setAnchor(d); setView('day'); };
  const toggleSource = (id: SourceId) => setHidden((h) => { const n = new Set(h); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div style={stack(20)}>
      <Card style={{ gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Icon name="calendar" size={20} color="var(--sky-500)" />
          <H3 style={{ flex: 1 }}>{rangeLabel(view, anchor)}</H3>
          {mode === 'live' && !accessErr && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)' }}>
              {loading ? '讀取 Google 日曆中…' : lastAt ? `Google 日曆 · ${hm(new Date(lastAt))} 更新` : 'Google 日曆'}
              <IconButton icon="refresh-cw" label="重新讀取" size="sm" onClick={refresh} />
            </span>
          )}
          {mode === 'sample' && <Badge tone="warning">範例行程</Badge>}
        </div>

        {mode === 'sample' && (
          <Notice tone="saffron" icon="calendar">
            目前顯示的是範例行程。在 claude.ai 開啟這個頁面並允許讀取 Google 日曆，就會換成你的 7 個 Google 日曆。
          </Notice>
        )}
        {accessErr && <Notice tone="danger" icon="triangle-alert">{accessMessage(accessErr.code, GOOGLE_CALENDAR)}</Notice>}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Tabs items={VIEWS} value={view} onChange={setView} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            <IconButton icon="chevron-left" label="上一段" size="sm" onClick={() => step(-1)} />
            <Button size="sm" variant="secondary" onClick={() => setAnchor(today)}>今天</Button>
            <IconButton icon="chevron-right" label="下一段" size="sm" onClick={() => step(1)} />
          </div>
        </div>

        {/* One chip per calendar: click to show or hide it. */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} role="group" aria-label="日曆">
          {SOURCES.map((s) => {
            const st = states[s.id];
            const on = !hidden.has(s.id);
            const n = inRange.filter((e) => e.sources.includes(s.id)).length;
            const err = st?.status === 'error' && !accessErr;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                className="chip"
                title={err ? `無法讀取：${st?.error?.message ?? ''}` : on ? '按一下隱藏' : '按一下顯示'}
                onClick={() => toggleSource(s.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 99, cursor: 'pointer',
                  border: `1px solid ${err ? 'var(--danger)' : on ? s.c : 'var(--border-default)'}`, background: on ? s.soft : 'var(--surface-card)',
                  color: on ? 'var(--ink-1)' : 'var(--ink-3)', font: '400 13px/1 var(--font-body)', opacity: on ? 1 : 0.7,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 99, background: on ? s.c : 'var(--ink-4)' }} />
                {s.name}
                {err ? <Icon name="triangle-alert" size={13} color="var(--danger)" />
                  : st?.status === 'loading' ? <span style={{ font: '400 11px var(--font-mono)', color: 'var(--ink-4)' }}>…</span>
                  : <span style={{ font: '400 11px var(--font-mono)', color: 'var(--ink-3)' }}>{n}</span>}
              </button>
            );
          })}
        </div>

        {view === 'week' && <WeekGrid from={from} events={inRange} today={today} conflictKeys={conflictKeys} onOpen={setOpen} onDay={openDay} />}
        {view === 'day' && <DayList day={anchor} events={inRange} conflictKeys={conflictKeys} onOpen={setOpen} />}
        {view === 'month' && <MonthGrid month={startOfMonth(anchor)} from={from} to={to} events={inRange} today={today} onDay={openDay} />}
        {view === 'list' && <ListView from={from} events={inRange} today={today} conflictKeys={conflictKeys} onOpen={setOpen} />}
      </Card>

      <div style={wrapRow(20, 'flex-start')}>
        <Card style={{ flex: '1.6 1 420px', gap: 6 }}>
          <CardHead title="時間衝突" align="center" style={{ marginBottom: 2 }}>
            {conflicts.length > 0 ? <Badge tone="danger" dot>{conflicts.length} 組</Badge> : <Muted>{rangeLabel(view, anchor)}</Muted>}
          </CardHead>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 4 }}>只比對你的個人行事曆和李總行程；團隊與會議室日曆是別人的時間，不算衝突。</div>
          {conflicts.length === 0 ? (
            <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>這段期間你和李總的行程都沒有重疊。</div>
          ) : conflicts.slice(0, 8).map((c) => (
            <Row key={c.a.key + c.b.key} style={{ display: 'grid', gridTemplateColumns: '92px minmax(0,1fr)', gap: 10, padding: '10px 0', alignItems: 'baseline' }}>
              <span style={{ font: '400 13px var(--font-mono)', color: 'var(--danger)' }}>{md(c.from)} {hm(c.from)}</span>
              <span style={{ fontSize: 14, color: 'var(--ink-1)', minWidth: 0 }}>
                <button type="button" onClick={() => setOpen(c.a)} style={linkBtn}>{c.a.title}</button>
                <span style={{ color: 'var(--ink-3)' }}> 和 </span>
                <button type="button" onClick={() => setOpen(c.b)} style={linkBtn}>{c.b.title}</button>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-3)' }}>{c.who} · 重疊 {hm(c.from)}–{hm(c.to)}</span>
              </span>
            </Row>
          ))}
          {conflicts.length > 8 && <Muted>還有 {conflicts.length - 8} 組，可以切到日或週檢視查看。</Muted>}
        </Card>

        <section style={{ flex: '1 1 300px', minWidth: 0, background: 'var(--saffron-100)', borderRadius: 20, padding: 24, boxSizing: 'border-box', ...stack(10) }}>
          <H3>李總行程整合看板</H3>
          <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>
            同樣的 7 個 Google 日曆，再加上協作平台日曆。看板會比對疑似重複的會議、會議室重複預約，以及沒有列入李總行程的會議。
          </div>
          <div>
            <a
              href={DASHBOARD_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, height: 32, padding: '0 14px', borderRadius: 999, textDecoration: 'none',
                background: 'var(--surface-card)', border: '1px solid var(--border-default)', color: 'var(--ink-1)', font: '500 13px/1 var(--font-body)',
              }}
            >
              開啟整合看板 <Icon name="external-link" size={16} />
            </a>
          </div>
        </section>
      </div>

      <EventDialog event={open} onClose={() => setOpen(null)} conflict={!!open && conflictKeys.has(open.key)} />
    </div>
  );
}

const linkBtn: CSSProperties = { border: 0, padding: 0, background: 'none', font: 'inherit', color: 'var(--ink-1)', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'var(--line-2)', textUnderlineOffset: 3, textAlign: 'left' };

function Notice({ tone, icon, children }: { tone: 'saffron' | 'danger'; icon: 'calendar' | 'triangle-alert'; children: React.ReactNode }) {
  const bg = tone === 'danger' ? 'var(--danger-soft)' : 'var(--saffron-100)';
  const ink = tone === 'danger' ? 'var(--danger)' : 'var(--saffron-700)';
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 14, background: bg, fontSize: 14, color: 'var(--ink-1)', lineHeight: 1.6 }}>
      <Icon name={icon} size={18} color={ink} style={{ marginTop: 2 }} />
      <span>{children}</span>
    </div>
  );
}

function SourceDots({ e }: { e: CalEvent }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3, flex: 'none' }} title={e.sources.map((s) => SOURCE_BY_ID[s].name).join('、')}>
      {e.sources.map((s) => <span key={s} style={{ width: 7, height: 7, borderRadius: 99, background: SOURCE_BY_ID[s].c }} />)}
    </span>
  );
}

function EventChip({ e, conflict, onOpen, showTime = true }: { e: CalEvent; conflict: boolean; onOpen: (e: CalEvent) => void; showTime?: boolean }) {
  const src = SOURCE_BY_ID[e.sources[0]];
  return (
    <button
      type="button"
      onClick={() => onOpen(e)}
      className="event-chip"
      style={{
        display: 'flex', flexDirection: 'column', gap: 2, width: '100%', padding: '7px 9px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
        background: conflict ? 'var(--danger-soft)' : src.soft, border: conflict ? '1px solid var(--danger)' : '1px solid transparent',
        font: 'inherit', boxSizing: 'border-box', minWidth: 0,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '400 11px/1.4 var(--font-mono)', color: conflict ? 'var(--danger)' : 'var(--ink-3)' }}>
        <SourceDots e={e} />
        {showTime && (e.allDay ? '全天' : hm(e.start))}
        {conflict && <Icon name="clock-alert" size={12} color="var(--danger)" />}
      </span>
      <span style={{ fontSize: 13, lineHeight: 1.4, color: 'var(--ink-1)', overflowWrap: 'anywhere' }}>{e.title}</span>
      {e.location && <span style={{ fontSize: 11, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.location}</span>}
    </button>
  );
}

function DayHead({ d, today, onClick }: { d: Date; today: Date; onClick?: () => void }) {
  const isToday = dayKey(d) === dayKey(today);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'baseline', gap: 6, border: 0, background: 'none', padding: '0 2px 6px', cursor: onClick ? 'pointer' : 'default', font: 'inherit' }}
    >
      <span style={{ font: '500 14px var(--font-body)', color: isToday ? 'var(--fox-700)' : 'var(--ink-1)' }}>週{WD[d.getDay()]}</span>
      <span style={{ font: '400 12px var(--font-mono)', color: isToday ? 'var(--fox-700)' : 'var(--ink-3)' }}>{md(d)}</span>
      {isToday && <span style={{ fontSize: 11, color: 'var(--fox-700)' }}>今天</span>}
    </button>
  );
}

function WeekGrid({ from, events, today, conflictKeys, onOpen, onDay: openDay }: {
  from: Date; events: CalEvent[]; today: Date; conflictKeys: Set<string>; onOpen: (e: CalEvent) => void; onDay: (d: Date) => void;
}) {
  return (
    <div className="cal-week" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 8 }}>
      {Array.from({ length: 7 }, (_, i) => {
        const d = addDays(from, i);
        const list = onDay(events, d);
        const isToday = dayKey(d) === dayKey(today);
        return (
          <div key={i} style={{ ...stack(6), minWidth: 0, padding: 8, borderRadius: 14, background: isToday ? 'var(--paper-1)' : 'transparent', border: isToday ? '1.5px solid var(--fox-300)' : '1px solid var(--line-1)', minHeight: 140 }}>
            <DayHead d={d} today={today} onClick={() => openDay(d)} />
            {list.length === 0 ? <span style={{ fontSize: 12, color: 'var(--ink-4)', padding: '0 2px' }}>沒有行程</span>
              : list.map((e) => <EventChip key={e.key} e={e} conflict={conflictKeys.has(e.key)} onOpen={onOpen} />)}
          </div>
        );
      })}
    </div>
  );
}

function DayList({ day, events, conflictKeys, onOpen }: { day: Date; events: CalEvent[]; conflictKeys: Set<string>; onOpen: (e: CalEvent) => void }) {
  const list = onDay(events, day);
  if (list.length === 0) return <Empty>這天沒有行程。</Empty>;
  return (
    <ol style={{ ...stack(0), listStyle: 'none', margin: 0, padding: 0 }}>
      {list.map((e) => {
        const src = SOURCE_BY_ID[e.sources[0]];
        const conflict = conflictKeys.has(e.key);
        return (
          <li key={e.key} style={{ display: 'grid', gridTemplateColumns: '52px 14px minmax(0,1fr)', gap: 10, alignItems: 'stretch' }}>
            <div style={{ font: '400 13px/26px var(--font-mono)', color: conflict ? 'var(--danger)' : 'var(--ink-3)' }}>{e.allDay ? '全天' : hm(e.start)}</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 9 }}>
              <span style={{ width: 10, height: 10, borderRadius: 99, background: src.c, flex: 'none' }} />
              <span style={{ flex: 1, width: 2, minHeight: 10, background: 'var(--line-1)', marginTop: 4 }} />
            </div>
            <button type="button" onClick={() => onOpen(e)} style={{ ...stack(3), padding: '2px 0 16px', border: 0, background: 'none', textAlign: 'left', cursor: 'pointer', font: 'inherit', minWidth: 0 }}>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ font: '500 15px/1.4 var(--font-body)', color: 'var(--ink-1)' }}>{e.title}</span>
                {conflict && <Badge tone="danger">時間衝突</Badge>}
              </span>
              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{timeLabel(e)}</span>
                {' · '}{e.sources.map((s) => SOURCE_BY_ID[s].name).join('、')}{e.location ? ` · ${e.location}` : ''}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function MonthGrid({ month, from, to, events, today, onDay: openDay }: { month: Date; from: Date; to: Date; events: CalEvent[]; today: Date; onDay: (d: Date) => void }) {
  const days = Math.round((to.getTime() - from.getTime()) / 86400e3);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 6 }}>
      {['一', '二', '三', '四', '五', '六', '日'].map((w) => <div key={w} style={{ font: 'var(--text-label)', color: 'var(--ink-3)', textAlign: 'center' }}>{w}</div>)}
      {Array.from({ length: days }, (_, i) => {
        const d = addDays(from, i);
        const list = onDay(events, d);
        const inMonth = d.getMonth() === month.getMonth();
        const isToday = dayKey(d) === dayKey(today);
        return (
          <button
            key={i}
            type="button"
            onClick={() => openDay(d)}
            aria-label={`${md(d)}，${list.length} 個行程`}
            aria-current={isToday ? 'date' : undefined}
            style={{
              ...stack(3), minHeight: 92, minWidth: 0, padding: '6px 7px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', font: 'inherit', boxSizing: 'border-box',
              background: inMonth ? 'var(--paper-0)' : 'var(--paper-1)', border: isToday ? '1.5px solid var(--fox-500)' : '1px solid var(--line-1)',
            }}
          >
            <span style={{ font: '500 13px var(--font-mono)', color: isToday ? 'var(--fox-700)' : inMonth ? 'var(--ink-1)' : 'var(--ink-4)' }}>{d.getDate()}</span>
            {list.slice(0, 3).map((e) => (
              <span key={e.key} className="month-line" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, lineHeight: 1.35, color: 'var(--ink-1)', minWidth: 0 }}>
                <span style={{ width: 6, height: 6, flex: 'none', borderRadius: 99, background: SOURCE_BY_ID[e.sources[0]].c }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
              </span>
            ))}
            {list.length > 3 && <span className="month-line" style={{ fontSize: 11, color: 'var(--ink-3)' }}>還有 {list.length - 3} 個</span>}
            {list.length > 0 && <span className="month-count" style={{ display: 'none', font: '400 11px var(--font-mono)', color: 'var(--ink-3)' }}>{list.length} 個</span>}
          </button>
        );
      })}
    </div>
  );
}

function ListView({ from, events, today, conflictKeys, onOpen }: { from: Date; events: CalEvent[]; today: Date; conflictKeys: Set<string>; onOpen: (e: CalEvent) => void }) {
  const days = Array.from({ length: LIST_DAYS }, (_, i) => addDays(from, i)).map((d) => [d, onDay(events, d)] as const).filter(([, l]) => l.length > 0);
  if (days.length === 0) return <Empty>接下來 {LIST_DAYS} 天沒有行程。</Empty>;
  return (
    <div style={stack(0)}>
      {days.map(([d, list]) => (
        <Row key={dayKey(d)} style={{ display: 'grid', gridTemplateColumns: '96px minmax(0,1fr)', gap: 12, padding: '12px 0' }}>
          <DayHead d={d} today={today} />
          <div style={stack(8)}>
            {list.map((e) => (
              <button key={e.key} type="button" onClick={() => onOpen(e)} style={{ display: 'grid', gridTemplateColumns: '92px minmax(0,1fr)', gap: 8, border: 0, background: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', font: 'inherit' }}>
                <span style={{ font: '400 13px var(--font-mono)', color: conflictKeys.has(e.key) ? 'var(--danger)' : 'var(--ink-3)' }}>{e.allDay ? '全天' : `${hm(e.start)}–${hm(e.end)}`}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, fontSize: 15, color: 'var(--ink-1)' }}>
                  <SourceDots e={e} />
                  <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{e.title}</span>
                  {conflictKeys.has(e.key) && <Badge tone="danger">衝突</Badge>}
                </span>
              </button>
            ))}
          </div>
        </Row>
      ))}
    </div>
  );
}

const Empty = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: '28px 18px', borderRadius: 14, background: 'var(--paper-2)', textAlign: 'center', color: 'var(--ink-2)', fontSize: 14 }}>{children}</div>
);

function EventDialog({ event: e, onClose, conflict }: { event: CalEvent | null; onClose: () => void; conflict: boolean }) {
  return (
    <Dialog open={!!e} onClose={onClose} title={e?.title ?? ''} width={480}>
      {e && (
        <div style={stack(12)}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ font: '500 14px var(--font-mono)', color: 'var(--ink-1)' }}>{md(e.start)} 週{WD[e.start.getDay()]} · {timeLabel(e)}</span>
            {conflict && <Badge tone="danger">時間衝突</Badge>}
            {e.recurring && <Badge>週期行程</Badge>}
            {e.free && <Badge tone="info">標為有空</Badge>}
          </div>
          <Detail label="日曆">
            <span style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {e.sources.map((s) => <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: SOURCE_BY_ID[s].c }} />{SOURCE_BY_ID[s].name}</span>)}
            </span>
          </Detail>
          {e.location && <Detail label="地點">{e.location}</Detail>}
          {e.attendees.length > 0 && <Detail label="與會">{e.attendees.slice(0, 8).join('、')}{e.attendees.length > 8 ? ` 等 ${e.attendees.length} 人` : ''}</Detail>}
          {e.description && <Detail label="說明"><span style={{ whiteSpace: 'pre-wrap', display: 'block', maxHeight: 160, overflowY: 'auto' }}>{e.description}</span></Detail>}
          {e.link && (
            <div><a href={e.link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}>在 Google 日曆開啟 <Icon name="external-link" size={14} /></a></div>
          )}
        </div>
      )}
    </Dialog>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '44px minmax(0,1fr)', gap: 10, fontSize: 14, color: 'var(--ink-1)' }}>
      <span style={{ font: 'var(--text-label)', color: 'var(--ink-3)', paddingTop: 2 }}>{label}</span>
      <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{children}</span>
    </div>
  );
}
