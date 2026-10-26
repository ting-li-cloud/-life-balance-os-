import { Badge } from '../ds/Display';
import { Checkbox } from '../ds/Forms';
import { Icon } from '../ds/Icon';
import {
  AREAS, AREA_LIGHT, CURRENT_MONTH, GOALS, LOAD_BG, LOAD_LEGEND, MONTH, MONTH_LABELS, MONTH_LOADS,
  WEEK_CHART_MAX_HOURS, WEEK_DATES, WEEK_DAYS, WEEK_SQUEEZED, YEAR_DATES, YEAR_OVERLOAD,
} from '../data/sample';
import { Card, CardHead, H3, LegendItem, Muted, ProgressBar, Row, SoftPill, Stat, stack, wrapRow } from '../components/ui';

export type WeekDone = Record<string, boolean>;
const mono = (size: number, color = 'var(--ink-3)', weight = 400) => ({ font: `${weight} ${size}px var(--font-mono)`, color });
const B = ({ children, color = 'var(--ink-1)' }: { children: React.ReactNode; color?: string }) => (
  <b style={{ font: '500 13px var(--font-mono)', color }}>{children}</b>
);

// ── 本週總覽 ──────────────────────────────────────────────────────────────
export function WeekView({ weekDone, onToggleAction }: { weekDone: WeekDone; onToggleAction: (key: string) => void }) {
  const actions = GOALS.flatMap((g) => g.week.map(([t, freq], j) => ({ key: `${g.id}-${j}`, t, meta: `${freq} · ${g.title}`, area: AREAS[g.area] })));
  const doneCount = actions.filter((a) => weekDone[a.key]).length;
  const sched = WEEK_DAYS.reduce((n, d) => n + d[2], 0);
  const avail = WEEK_DAYS.reduce((n, d) => n + d[3], 0);
  const overDays = WEEK_DAYS.filter(([, , h, cap]) => h > cap).length;
  const pct = (h: number) => (h / WEEK_CHART_MAX_HOURS) * 100;

  return (
    <div style={stack(20)}>
      <div style={wrapRow(20)}>
        <Card style={{ flex: '1.6 1 520px', gap: 18 }}>
          <CardHead title="本週負荷" align="center"><Badge tone="danger" dot>{overDays} 天超載</Badge></CardHead>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8 }}>
            <Stat label="已排定" value={sched.toFixed(1)} />
            <Stat label="可安排" value={avail.toFixed(1)} />
            <Stat label="休息被占用" value="2" unit="次" color="var(--danger)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 10 }}>
            {WEEK_DAYS.map(([name, date, h, cap], i) => (
              <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={mono(12)}>{h} h</div>
                <div
                  role="img"
                  aria-label={`週${name} 已排定 ${h} 小時，可安排 ${cap} 小時`}
                  style={{ position: 'relative', width: '100%', maxWidth: 44, height: 150, borderRadius: 10, background: 'var(--paper-2)', display: 'flex', flexDirection: 'column-reverse', overflow: 'hidden' }}
                >
                  <span style={{ height: `${pct(Math.min(h, cap))}%`, background: 'var(--sky-500)' }} />
                  <span style={{ height: `${pct(Math.max(0, h - cap))}%`, background: 'var(--danger)' }} />
                  <span style={{ position: 'absolute', left: 0, right: 0, bottom: `${pct(cap)}%`, borderTop: '2px dashed var(--ink-1)', opacity: 0.55 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
                  <span style={{ font: '500 14px var(--font-body)', color: i === 0 ? 'var(--fox-700)' : 'var(--ink-1)' }}>{name}</span>
                  <span style={mono(11)}>{date}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--ink-3)' }}>
            <LegendItem color="var(--sky-500)">已排定</LegendItem>
            <LegendItem color="var(--danger)">超出</LegendItem>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 14, borderTop: '2px dashed var(--ink-3)' }} />當天可安排時數</span>
          </div>
        </Card>

        <Card style={{ flex: '1 1 320px', gap: 6 }}>
          <H3 style={{ marginBottom: 6 }}>本週被擠掉的事</H3>
          {WEEK_SQUEEZED.map((q) => (
            <Row key={q.t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, color: 'var(--ink-1)' }}>{q.t}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{q.meta}</div>
              </div>
              <Badge tone={q.tone}>{q.state}</Badge>
            </Row>
          ))}
          <div style={{ marginTop: 'auto', padding: '12px 14px', borderRadius: 14, background: 'var(--dusk-100)', fontSize: 14, color: 'var(--ink-1)' }}>
            週三晚上是這週最滿的時候。要不要先把重訓排到週四早上？
          </div>
        </Card>
      </div>

      <div style={wrapRow(20, 'flex-start')}>
        <Card style={{ flex: '1.25 1 420px', gap: 6 }}>
          <CardHead title="本週目標行動" style={{ marginBottom: 6 }}>
            <Muted>由目標管理拆解 · 完成 <span style={{ fontFamily: 'var(--font-mono)' }}>{doneCount} / {actions.length}</span> 項</Muted>
          </CardHead>
          {actions.map((a) => (
            <Row key={a.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Checkbox checked={!!weekDone[a.key]} onChange={() => onToggleAction(a.key)} label={a.t} description={a.meta} color={a.area.c} />
              </div>
              <SoftPill bg={a.area.soft}>{a.area.label.slice(0, 2)}</SoftPill>
            </Row>
          ))}
        </Card>
        <Card style={{ flex: '1 1 320px', gap: 6 }}>
          <H3 style={{ marginBottom: 6 }}>本週重要日期</H3>
          {WEEK_DATES.map((k) => (
            <Row key={k.d} style={{ display: 'grid', gridTemplateColumns: '84px minmax(0,1fr)', gap: 10, alignItems: 'center', padding: '11px 0' }}>
              <span style={mono(13)}>{k.d}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: 'var(--ink-1)' }}>
                <span style={{ width: 8, height: 8, flex: 'none', borderRadius: 99, background: k.c }} />{k.t}
              </span>
            </Row>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── 本月總覽 ──────────────────────────────────────────────────────────────
const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export function MonthView() {
  const { year, month, today } = MONTH;
  const daysInMonth = new Date(year, month, 0).getDate();
  const lead = (new Date(year, month - 1, 1).getDay() + 6) % 7; // Monday-first offset
  const cells = Math.ceil((lead + daysInMonth) / 7) * 7;
  const overDays = Object.values(MONTH_LOADS).filter((l) => l === 4).length;

  return (
    <div style={wrapRow(20, 'flex-start')}>
      <Card style={{ flex: '1.7 1 560px', gap: 14 }}>
        <CardHead title={`${month} 月行事曆`} align="center">
          <Muted>超載 <B color="var(--danger)">{overDays}</B> 天 · 休息被占用 <B>6</B> 次 · 目標行動完成 <B color="var(--sage-700)">62%</B></Muted>
        </CardHead>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 6 }}>
          {WEEKDAYS.map((w) => <div key={w} style={{ font: 'var(--text-label)', color: 'var(--ink-3)', textAlign: 'center', paddingBottom: 4 }}>{w}</div>)}
          {Array.from({ length: cells }, (_, i) => {
            const n = i - lead + 1;
            if (n < 1 || n > daysInMonth) return <div key={i} style={{ minHeight: 74 }} />;
            const label = MONTH_LABELS[n];
            return (
              <div
                key={i}
                aria-current={n === today ? 'date' : undefined}
                style={{
                  minHeight: 74, padding: '7px 8px', borderRadius: 10, background: LOAD_BG[MONTH_LOADS[n] ?? 2],
                  border: n === today ? '1.5px solid var(--fox-500)' : '1px solid var(--line-1)',
                  display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, boxSizing: 'border-box',
                }}
              >
                <span style={mono(13, n < today ? 'var(--ink-3)' : 'var(--ink-1)', 500)}>{n}</span>
                {label && <span style={{ fontSize: 11, lineHeight: 1.35, color: 'var(--ink-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--ink-3)' }}>
          {LOAD_LEGEND.map((l) => (
            <span key={l.level} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: LOAD_BG[l.level], border: '1px solid var(--line-1)', boxSizing: 'border-box' }} />{l.label}
            </span>
          ))}
        </div>
      </Card>

      <Card style={{ flex: '1 1 300px', gap: 6 }}>
        <CardHead title="本月里程碑" style={{ marginBottom: 6 }}><Muted>來自 {GOALS.length} 個目標</Muted></CardHead>
        {GOALS.map((g) => {
          const a = AREAS[g.area];
          return (
            <Row key={g.id} style={{ ...stack(6), padding: '12px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, flex: 'none', borderRadius: 99, background: a.c }} />
                <span style={{ flex: 1, fontSize: 15, color: 'var(--ink-1)' }}>{g.milestone.title}</span>
                <span style={mono(12)}>{g.milestone.pct}%</span>
              </div>
              <ProgressBar pct={g.milestone.pct} color={a.c} />
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{a.label} · {g.title} · {g.milestone.meta}</div>
            </Row>
          );
        })}
      </Card>
    </div>
  );
}

// ── 今年總覽 ──────────────────────────────────────────────────────────────
const YEAR_COLS = 'minmax(200px,1.2fr) minmax(300px,2fr) 52px';

export function YearView() {
  const total = YEAR_OVERLOAD.reduce((n, v) => n + v, 0);
  return (
    <div style={stack(20)}>
      <Card style={{ gap: 10, overflowX: 'auto' }}>
        <CardHead title="年度目標" style={{ marginBottom: 6 }}><Muted>每格是一個月 · 深色是那個月有做到</Muted></CardHead>
        <div style={{ display: 'grid', gridTemplateColumns: YEAR_COLS, gap: 14, alignItems: 'center', minWidth: 600 }}>
          <span />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', gap: 4 }}>
            {Array.from({ length: 12 }, (_, i) => <span key={i} style={{ ...mono(11), textAlign: 'center' }}>{i + 1}</span>)}
          </div>
          <span />
        </div>
        {GOALS.map((g) => {
          const a = AREAS[g.area];
          const strip = Array.from({ length: 12 }, (_, i) =>
            i < CURRENT_MONTH ? (g.strip[i] ? a.c : a.soft) : i === CURRENT_MONTH ? AREA_LIGHT[g.area] : 'var(--paper-2)');
          return (
            <Row key={g.id} style={{ display: 'grid', gridTemplateColumns: YEAR_COLS, gap: 14, alignItems: 'center', padding: '10px 0', minWidth: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ width: 30, height: 30, flex: 'none', borderRadius: 999, display: 'grid', placeItems: 'center', background: a.soft }}><Icon name={a.icon} size={15} color={a.ink} /></span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, color: 'var(--ink-1)' }}>{g.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{a.label} · {g.yearMeta}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', gap: 4 }}>
                {strip.map((c, i) => <span key={i} style={{ height: 22, borderRadius: 6, background: c }} />)}
              </div>
              <span style={{ ...mono(14, 'var(--ink-1)', 500), textAlign: 'right' }}>{g.pct}%</span>
            </Row>
          );
        })}
      </Card>

      <div style={wrapRow(20)}>
        <Card style={{ flex: '1.3 1 420px', gap: 14 }}>
          <CardHead title="每月超載天數"><Muted>今年共 <B>{total}</B> 天 · 11、12 月為預估</Muted></CardHead>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', gap: 8, alignItems: 'end', height: 170 }}>
            {YEAR_OVERLOAD.map((v, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4, height: '100%' }}>
                <span style={mono(11)}>{v}</span>
                <span style={{ width: '100%', maxWidth: 28, height: `${(v / 8) * 100}%`, borderRadius: '6px 6px 3px 3px', background: i > CURRENT_MONTH ? 'var(--paper-3)' : v >= 6 ? 'var(--fox-300)' : 'var(--sky-300)' }} />
                <span style={mono(11, i === CURRENT_MONTH ? 'var(--fox-700)' : 'var(--ink-3)')}>{i + 1}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ flex: '1 1 320px', gap: 6 }}>
          <H3 style={{ marginBottom: 6 }}>年度重要時程</H3>
          {YEAR_DATES.map((k) => (
            <Row key={k.t} style={{ display: 'grid', gridTemplateColumns: '52px minmax(0,1fr) auto', gap: 10, alignItems: 'center', padding: '10px 0' }}>
              <span style={mono(13)}>{k.d}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: k.done ? 'var(--ink-3)' : 'var(--ink-1)' }}>
                <span style={{ width: 8, height: 8, flex: 'none', borderRadius: 99, background: k.c }} />{k.t}
              </span>
              <Icon name={k.done ? 'circle-check' : 'circle-dashed'} size={16} color="var(--ink-3)" />
            </Row>
          ))}
        </Card>
      </div>
    </div>
  );
}
