import { useState, type CSSProperties } from 'react';
import { Badge, Tag } from '../ds/Display';
import { Button, IconButton } from '../ds/Button';
import { Checkbox } from '../ds/Forms';
import { Icon } from '../ds/Icon';
import {
  CARE, CATEGORIES, LIFE, TIMELINE_LEGEND,
  capacityFor, eventsFor, type FocusItem, type Scenario,
} from '../data/sample';
import { dueBadge, homeMeta, type WaitingItem, type WorkTask } from '../data/work';
import { WaitingRow } from './WorkView';
import { Card, CardHead, H3, LegendItem, Muted, Row, SoftPill, Stat, stack, wrapRow } from '../components/ui';
import botanical from '../assets/botanical-watercolor.jpg';
import fox from '../assets/fox-dusk.jpg';

export type HeroImage = 'botanical' | 'fox';

interface Props {
  scenario: Scenario;
  applied: boolean;
  focus: FocusItem[];
  onSwapFocus: (slot: number) => void;
  onOpenReschedule: () => void;
  heroImage: HeroImage;
  workCount: number;
  /** Shared with 工作管理. */
  tasks: WorkTask[];
  waiting: WaitingItem[];
  onToggleTask: (id: string) => void;
  onFollow: (id: string) => void;
  /** Open 工作管理. */
  onOpenWork: () => void;
  /** Open 行事曆. */
  onOpenCalendar: () => void;
  /** 生活待辦 (`l0`…) and 今日生活照顧 (`c0`…) check marks, kept in the app so they survive page switches. */
  checks: Record<string, boolean>;
  onToggleCheck: (key: string) => void;
}

export function TodayView({
  scenario, applied, focus, onSwapFocus, onOpenReschedule, heroImage, workCount,
  tasks, waiting, onToggleTask, onFollow, onOpenWork, onOpenCalendar, checks, onToggleCheck,
}: Props) {
  const [showAllWork, setShowAllWork] = useState(false);

  const cap = capacityFor(scenario, applied);
  const events = eventsFor(scenario);
  const todayWork = tasks.filter((t) => t.today);
  const work = showAllWork ? todayWork : todayWork.slice(0, workCount);
  const missing = todayWork.filter((t) => !t.done && t.estimate === undefined);
  const followToday = waiting.filter((w) => w.followToday);
  const lifeLeft = LIFE.filter((_, i) => !checks[`l${i}`]).length;

  return (
    <div style={stack(20)}>
      {/* 3 重新安排今日 — overload banner */}
      {scenario === 'overload' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, background: 'var(--saffron-100)', flexWrap: 'wrap' }}>
          <Icon name="triangle-alert" size={20} color="var(--saffron-700)" />
          <div style={{ flex: 1, minWidth: 240, color: 'var(--ink-1)' }}>
            <b style={{ fontWeight: 500 }}>今天多排了 1.5 小時，21:00 的休息被占用了。</b>
            <span style={{ color: 'var(--ink-2)' }}> 要不要把一件不急的事移到明天？</span>
          </div>
          <Button size="sm" variant="secondary" onClick={onOpenReschedule}>看建議</Button>
        </div>
      )}

      <div style={wrapRow(20)}>
        {/* 1 今日重點 */}
        <section
          className="focus-card"
          style={{
            flex: '1.6 1 520px', minWidth: 0, background: 'var(--paper-0)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-1)',
            borderRadius: 28, overflow: 'hidden', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 180px',
          }}
        >
          <div style={{ padding: '26px 28px', ...stack(16) }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, font: '700 24px/1.3 var(--font-display)', color: 'var(--ink-1)' }}>今日重點</h2>
              <span style={{ font: 'var(--text-label)', fontWeight: 400, color: 'var(--ink-3)' }}>系統建議 · 最多 3 件 · 可以替換</span>
            </div>
            <div style={stack(0)}>
              {focus.map((f, i) => {
                const c = CATEGORIES[f.cat];
                return (
                  <Row key={f.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 0' }}>
                    <span style={{ width: 30, height: 30, flex: 'none', borderRadius: 999, display: 'grid', placeItems: 'center', background: c.soft, color: c.ink, font: '500 14px var(--font-mono)' }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0, ...stack(4) }}>
                      <div style={{ font: '500 16px/1.45 var(--font-body)', color: 'var(--ink-1)', textWrap: 'pretty' } as CSSProperties}>{f.title}</div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 13, color: 'var(--ink-3)' }}>
                        <LegendItem color={c.c} swatch="dot">{c.label}</LegendItem>
                        <span>·</span><span style={{ fontFamily: 'var(--font-mono)' }}>{f.dur}</span>
                        <span>·</span><span>{f.why}</span>
                      </div>
                    </div>
                    <IconButton icon="replace" label="替換" size="sm" onClick={() => onSwapFocus(i)} />
                  </Row>
                );
              })}
            </div>
          </div>
          <div className="focus-hero" style={{ minHeight: '100%', display: 'flex' }}>
            <img src={heroImage === 'fox' ? fox : botanical} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%', display: 'block' }} />
          </div>
        </section>

        {/* 2 負荷與時間容量 */}
        <Card style={{ flex: '1 1 320px', gap: 16 }}>
          <CardHead title="負荷與時間容量" align="center">
            <Badge tone={cap.tone} dot>{cap.status}</Badge>
          </CardHead>
          {cap.known ? (
            <div style={stack(16)}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8 }}>
                <Stat label="已排定" value={cap.sched} />
                <Stat label="可安排" value={cap.avail} />
                <Stat label={cap.deltaLabel!} value={cap.delta} color={cap.deltaColor} />
              </div>
              <div style={stack(6)}>
                <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', background: 'var(--paper-2)', gap: 2 }}>
                  {cap.segs!.map((s) => <span key={s.label} style={{ flex: `${s.flex} 0 0`, background: s.c }} />)}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: 'var(--ink-3)' }}>
                  {cap.segs!.map((s) => <LegendItem key={s.label} color={s.c}>{s.label}</LegendItem>)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 14, background: cap.restBg }}>
                <Icon name="moon" size={18} color="var(--dusk-700)" />
                <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-1)' }}>{cap.rest}</div>
              </div>
            </div>
          ) : (
            <div style={{ ...stack(12), padding: 18, borderRadius: 14, background: 'var(--paper-2)' }}>
              <div style={{ font: '400 22px/1.3 var(--font-display)', color: 'var(--ink-1)' }}>資料尚不足</div>
              <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>
                有 {missing.length} 件今天的工作還沒填預估工時，所以還算不出今天塞不塞得下。先補上這 {missing.length} 件，花你 1 分鐘？
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {missing.map((t) => <Tag key={t.id} color="var(--area-work)">{t.short ?? t.title}</Tag>)}
              </div>
              <div><Button size="sm" variant="secondary" icon="timer" onClick={onOpenWork}>補上工時</Button></div>
            </div>
          )}
        </Card>
      </div>

      <div style={wrapRow(20, 'flex-start')}>
        {/* 4 今日行程 */}
        <Card style={{ flex: '1 1 360px', gap: 14 }}>
          <CardHead title="今日行程" align="center">
            <Muted>{events.length} 個時段</Muted>
            <Button size="sm" variant="ghost" iconRight="arrow-right" onClick={onOpenCalendar}>行事曆</Button>
          </CardHead>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TIMELINE_LEGEND.map((k) => {
              const c = CATEGORIES[k];
              return (
                <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px 3px 8px', borderRadius: 999, background: c.soft, fontSize: 12, color: 'var(--ink-1)', lineHeight: 1.7 }}>
                  <Icon name={c.icon} size={13} color={c.ink} />{c.label}
                </span>
              );
            })}
          </div>
          <ol style={{ ...stack(0), listStyle: 'none', margin: 0, padding: 0 }}>
            {events.map((e) => {
              const c = CATEGORIES[e.cat];
              return (
                <li key={e.t + e.title} style={{ display: 'grid', gridTemplateColumns: '48px 32px minmax(0,1fr)', gap: 10, alignItems: 'stretch' }}>
                  <div style={{ font: '400 13px/32px var(--font-mono)', color: e.now ? 'var(--fox-700)' : 'var(--ink-3)' }}>{e.t}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ width: 32, height: 32, flex: 'none', borderRadius: 999, display: 'grid', placeItems: 'center', background: c.soft }}>
                      <Icon name={c.icon} size={16} color={c.ink} />
                    </span>
                    <span style={{ flex: 1, width: 2, minHeight: 10, background: 'var(--line-1)' }} />
                  </div>
                  <div style={{ padding: '4px 0 16px', ...stack(3) }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ font: '500 15px/1.4 var(--font-body)', color: 'var(--ink-1)' }}>{e.title}</span>
                      {e.now && <Badge tone="brand" dot>進行中</Badge>}
                      {e.temp && <Badge tone="warning">臨時交辦</Badge>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{e.t}–{e.e}</span> · {e.sub}
                    </div>
                    {e.conflict && (
                      <div style={{ marginTop: 4, display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: 12, lineHeight: 1.5 }}>
                        <Icon name="clock-alert" size={13} color="var(--danger)" />{e.conflict}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        <div style={{ flex: '1.25 1 400px', minWidth: 0, ...stack(20) }}>
          {/* 5 工作待辦 */}
          <Card style={{ gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <Icon name="briefcase" size={20} color="var(--sky-500)" />
              <H3 style={{ flex: 1 }}>工作待辦</H3>
              <Muted>天意能創 · 子公司財務、業務控管</Muted>
            </div>
            {work.map((w) => {
              // Ad-hoc work shows 臨時; otherwise flag what is due today.
              const badge = w.done ? null : w.source === '臨時交辦' ? { label: '臨時', tone: 'warning' as const } : dueBadge(w);
              return (
                <Row key={w.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 0' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Checkbox checked={w.done} onChange={() => onToggleTask(w.id)} label={w.title} description={homeMeta(w)} color="var(--sky-500)" />
                  </div>
                  {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
                </Row>
              );
            })}
            <Row style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0 6px' }}>
              <Icon name="hourglass" size={16} color="var(--ink-3)" />
              <span style={{ font: 'var(--text-label)', color: 'var(--ink-2)' }}>等待他人 · 今天該追蹤</span>
            </Row>
            {followToday.map((w) => <WaitingRow key={w.id} w={w} onFollow={() => onFollow(w.id)} />)}
            <div style={{ paddingTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {todayWork.length > workCount && (
                <Button size="sm" variant="ghost" iconRight={showAllWork ? 'chevron-up' : 'chevron-down'} onClick={() => setShowAllWork((v) => !v)}>
                  {showAllWork ? '收合' : `顯示全部 ${todayWork.length} 筆`}
                </Button>
              )}
              <Button size="sm" variant="ghost" iconRight="arrow-right" onClick={onOpenWork} style={{ marginLeft: 'auto' }}>到工作管理</Button>
            </div>
          </Card>

          {/* 6 生活待辦 */}
          <Card style={{ gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Icon name="house" size={20} color="var(--sage-500)" />
              <H3 style={{ flex: 1 }}>生活待辦</H3>
              <Muted>{lifeLeft} 件未完成</Muted>
            </div>
            {LIFE.map((l, i) => {
              const c = CATEGORIES[l.cat];
              return (
                <Row key={l.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 0' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Checkbox checked={!!checks[`l${i}`]} onChange={() => onToggleCheck(`l${i}`)} label={l.title} description={l.meta} color={c.c} />
                  </div>
                  <SoftPill bg={c.soft}>{l.kind}</SoftPill>
                </Row>
              );
            })}
          </Card>
        </div>
      </div>

      {/* 7 今日生活照顧 */}
      <section style={{ background: 'var(--sage-100)', borderRadius: 20, padding: '22px 24px', ...stack(14) }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <H3>今日生活照顧</H3>
          <span style={{ font: '400 16px var(--font-hand)', color: 'var(--sage-700)' }}>可選，做一件就很好 ♡</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          {CARE.map((c, i) => {
            const on = !!checks[`c${i}`];
            return (
              <button
                key={c.title}
                type="button"
                className="care-card"
                aria-pressed={on}
                onClick={() => onToggleCheck(`c${i}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, border: '1px solid var(--line-1)',
                  background: on ? 'var(--paper-1)' : 'var(--paper-0)', cursor: 'pointer', textAlign: 'left', font: 'inherit',
                  transition: 'background var(--dur-base) var(--ease-out)',
                }}
              >
                <Icon name={c.icon} size={22} color="var(--sage-700)" />
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 15, color: on ? 'var(--ink-3)' : 'var(--ink-1)', textDecoration: on ? 'line-through' : 'none' }}>{c.title}</span>
                  <span style={{ font: '400 12px var(--font-mono)', color: 'var(--ink-3)' }}>{c.min}</span>
                </span>
                <Icon name={on ? 'circle-check' : 'circle'} size={18} color="var(--sage-700)" />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
