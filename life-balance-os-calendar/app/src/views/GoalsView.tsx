import { useState } from 'react';
import { Button } from '../ds/Button';
import { ProgressRing } from '../ds/Display';
import { Icon } from '../ds/Icon';
import { AREAS, GOALS, type AreaKey, type Palette } from '../data/sample';
import { ProgressBar, stack } from '../components/ui';
import type { WeekDone } from './PeriodViews';

type Filter = AreaKey | 'all';
const ALL: Palette = { label: '全部目標', icon: 'target', c: 'var(--ink-2)', soft: 'var(--paper-2)', ink: 'var(--ink-2)' };
const label = { font: 'var(--text-label)', color: 'var(--ink-3)', letterSpacing: '.08em' } as const;
const step = { padding: 14, borderRadius: 14, background: 'var(--paper-2)', ...stack(6) };

function StepLabel({ children, color = 'var(--ink-3)', arrow = 'var(--ink-4)' }: { children: string; color?: string; arrow?: string }) {
  return (
    <div style={{ ...label, color, display: 'flex', alignItems: 'center', gap: 6 }}>
      <Icon name="arrow-right" size={13} color={arrow} />{children}
    </div>
  );
}

export function GoalsView({ weekDone }: { weekDone: WeekDone }) {
  const [filter, setFilter] = useState<Filter>('all');
  const tiles: [Filter, Palette][] = [['all', ALL], ...(Object.entries(AREAS) as [AreaKey, Palette][])];
  const goals = GOALS.filter((g) => filter === 'all' || g.area === filter);

  return (
    <div style={stack(20)}>
      {/* Area tiles — filter goals by 家務管理 / 個人生活 / 家庭生活 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
        {tiles.map(([key, a]) => {
          const gs = key === 'all' ? GOALS : GOALS.filter((g) => g.area === key);
          const avg = Math.round(gs.reduce((n, g) => n + g.pct, 0) / gs.length);
          const acts = gs.reduce((n, g) => n + g.week.length, 0);
          const on = filter === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, cursor: 'pointer', font: 'inherit',
                background: on ? a.soft : 'var(--paper-0)', border: on ? `1.5px solid ${a.c}` : '1px solid var(--line-1)',
                boxShadow: on ? 'none' : 'var(--shadow-1)', transition: 'all var(--dur-base) var(--ease-out)',
              }}
            >
              <ProgressRing value={avg} size={48} color={a.c}><span style={{ font: '500 12px var(--font-mono)', color: 'var(--ink-1)' }}>{avg}</span></ProgressRing>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '500 15px var(--font-body)', color: 'var(--ink-1)' }}>
                  <Icon name={a.icon} size={16} color={a.ink} />{a.label}
                </span>
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{gs.length} 個目標 · 本週 {acts} 項行動</span>
              </span>
            </button>
          );
        })}
      </div>

      {goals.map((g) => {
        const a = AREAS[g.area];
        return (
          <section
            key={g.id}
            style={{ background: 'var(--paper-0)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-1)', borderRadius: 20, padding: '22px 24px', ...stack(16) }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ width: 40, height: 40, flex: 'none', borderRadius: 999, display: 'grid', placeItems: 'center', background: a.soft }}><Icon name={a.icon} size={20} color={a.ink} /></span>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ font: '700 21px/1.35 var(--font-display)', color: 'var(--ink-1)' }}>{g.title}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{a.label} · {g.why}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{g.yearMeta}</span>
                <ProgressRing value={g.pct} size={52} color={a.c}><span style={{ font: '500 12px var(--font-mono)', color: 'var(--ink-1)' }}>{g.pct}%</span></ProgressRing>
              </div>
            </div>

            {/* 今年 → 本月里程碑 → 本週行動 → 今天的下一步 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 10 }}>
              <div style={step}>
                <div style={label}>今年</div>
                <div style={{ fontSize: 14, color: 'var(--ink-1)' }}>{g.title}</div>
                <ProgressBar pct={g.pct} color={a.c} track="var(--paper-3)" style={{ marginTop: 'auto' }} />
              </div>
              <div style={step}>
                <StepLabel>本月里程碑</StepLabel>
                <div style={{ fontSize: 14, color: 'var(--ink-1)' }}>{g.milestone.title}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{g.milestone.meta}</div>
                <ProgressBar pct={g.milestone.pct} color={a.c} track="var(--paper-3)" style={{ marginTop: 'auto' }} />
              </div>
              <div style={step}>
                <StepLabel>本週行動</StepLabel>
                {g.week.map(([t, freq], j) => {
                  const d = !!weekDone[`${g.id}-${j}`];
                  return (
                    <div key={t} style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 14, color: d ? 'var(--ink-3)' : 'var(--ink-1)', textDecoration: d ? 'line-through' : 'none' }}>{t}</span>
                      <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{freq}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ ...step, background: a.soft }}>
                <StepLabel color={a.ink} arrow={a.ink}>今天的下一步</StepLabel>
                <div style={{ fontSize: 14, color: 'var(--ink-1)' }}>{g.today}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 'auto' }}>{g.todayWhere}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 2 }}>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-3)' }}>
                執行細項同步到 <b style={{ fontWeight: 500, color: 'var(--ink-1)' }}>{a.label}</b>
              </span>
              <Button size="sm" variant="ghost" icon="list-tree">拆解細項</Button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
