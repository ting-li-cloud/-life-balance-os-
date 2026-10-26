// Sample data from the Claude Design prototype (今日總覽 v2). Items, names and times are
// placeholders, not real 天意能創 data. Swap this module for real data sources later.
import type { IconName } from '../ds/Icon';
import type { BadgeTone } from '../ds/Display';

export interface Palette { label: string; icon: IconName; c: string; soft: string; ink: string }

export type CategoryKey = 'work' | 'personal' | 'chores' | 'couple' | 'rest' | 'money';
export const CATEGORIES: Record<CategoryKey, Palette> = {
  work: { label: '工作', icon: 'briefcase', c: 'var(--sky-500)', soft: 'var(--sky-100)', ink: 'var(--sky-700)' },
  personal: { label: '個人', icon: 'user', c: 'var(--saffron-500)', soft: 'var(--saffron-100)', ink: 'var(--saffron-700)' },
  chores: { label: '家務', icon: 'house', c: 'var(--sage-500)', soft: 'var(--sage-100)', ink: 'var(--sage-700)' },
  couple: { label: '夫妻', icon: 'heart', c: 'var(--fox-500)', soft: 'var(--fox-100)', ink: 'var(--fox-700)' },
  rest: { label: '休息', icon: 'moon', c: 'var(--dusk-500)', soft: 'var(--dusk-100)', ink: 'var(--dusk-700)' },
  money: { label: '帳單', icon: 'wallet', c: 'var(--area-money)', soft: 'var(--paper-2)', ink: 'var(--ink-2)' },
};
export const TIMELINE_LEGEND: CategoryKey[] = ['work', 'personal', 'chores', 'couple', 'rest'];

export type AreaKey = 'chores' | 'personal' | 'family';
export const AREAS: Record<AreaKey, Palette> = {
  chores: { label: '家務管理', icon: 'house', c: 'var(--sage-500)', soft: 'var(--sage-100)', ink: 'var(--sage-700)' },
  personal: { label: '個人生活', icon: 'user', c: 'var(--saffron-500)', soft: 'var(--saffron-100)', ink: 'var(--saffron-700)' },
  family: { label: '家庭生活', icon: 'users', c: 'var(--fox-500)', soft: 'var(--fox-100)', ink: 'var(--fox-700)' },
};
/** 300-step pigment per area, used for the current (in-progress) month on the year strip. */
export const AREA_LIGHT: Record<AreaKey, string> = { chores: 'var(--sage-300)', personal: 'var(--saffron-300)', family: 'var(--fox-300)' };

// ── Navigation (網站地圖) ────────────────────────────────────────────────
export type ViewKey = 'today' | 'week' | 'month' | 'year' | 'goals' | 'work' | 'calendar';
/** Views that live under 今日總覽 and share the period tabs. */
export const PERIOD_VIEWS: ViewKey[] = ['today', 'week', 'month', 'year'];
export const NAV: { icon: IconName; label: string; view?: ViewKey }[] = [
  { icon: 'sun', label: '今日總覽', view: 'today' },
  { icon: 'inbox', label: '快速收件匣' },
  { icon: 'briefcase', label: '工作管理', view: 'work' },
  { icon: 'calendar', label: '行事曆', view: 'calendar' },
  { icon: 'house', label: '家務管理' },
  { icon: 'user', label: '個人生活' },
  { icon: 'users', label: '家庭生活' },
  { icon: 'target', label: '目標管理', view: 'goals' },
  { icon: 'repeat', label: '習慣追蹤' },
  { icon: 'notebook-pen', label: '回顧與調整' },
  { icon: 'settings', label: '系統設定' },
];

export const HEADER: Record<ViewKey, string> = {
  today: '10 月 26 日 · 週一 · 10:40',
  week: '10 月 26 日 – 11 月 1 日 · 第 44 週',
  month: '2026 年 10 月 · 還剩 6 天',
  year: '2026 年 · 還剩 66 天',
  goals: '目標管理 · 6 個進行中',
  work: '工作管理 · 天意能創 · 子公司財務、業務控管',
  calendar: '行事曆 · Google 日曆 · 7 個日曆',
};
export const HEADER_TITLE: Record<Exclude<ViewKey, 'today' | 'work'>, string> = {
  calendar: '公司和個人的行程，放在一起看。',
  week: '這週有 2 天超載，週三最滿。',
  month: '這個月有 5 天超載，月底最密。',
  year: '6 個目標平均完成 51%。',
  goals: '從今年的目標，拆到今天的下一步。',
};

// ── 今日 ─────────────────────────────────────────────────────────────────
export type Scenario = 'overload' | 'normal' | 'nodata';

export interface FocusItem { title: string; cat: CategoryKey; dur: string; why: string }
/** Candidate pool for 今日重點; the first three are the default suggestions. */
export const FOCUS_POOL: FocusItem[] = [
  { title: '完成天意能創 10 月子公司營收對帳', cat: 'work', dur: '90 分鐘', why: '今天到期' },
  { title: '回覆李經理 Q4 業務預算調整', cat: 'work', dur: '30 分鐘', why: '主管交辦' },
  { title: '繳信用卡帳單', cat: 'money', dur: '10 分鐘', why: '10/27 到期' },
  { title: '簽核供應商付款單 3 筆', cat: 'work', dur: '15 分鐘', why: '付款日前一天' },
  { title: '和另一半訂週末的餐廳', cat: 'couple', dur: '10 分鐘', why: '週三前要訂' },
  { title: 'Q4 預算差異分析', cat: 'work', dur: '90 分鐘', why: '週三董事會用' },
];

export interface CapacitySegment { flex: number; c: string; label: string }
export interface Capacity {
  known: boolean; status: string; tone: BadgeTone;
  sched?: string; avail?: string; delta?: string; deltaLabel?: string; deltaColor?: string;
  segs?: CapacitySegment[]; rest?: string; restBg?: string;
}
export function capacityFor(scenario: Scenario, applied: boolean): Capacity {
  if (scenario === 'nodata') return { known: false, status: '資料尚不足', tone: 'neutral' };
  if (scenario === 'overload') {
    return {
      known: true, status: '超載', tone: 'danger', sched: '10.5', avail: '9.0', delta: '+1.5', deltaLabel: '超出', deltaColor: 'var(--danger)',
      segs: [{ flex: 9, c: 'var(--sky-500)', label: '已排定' }, { flex: 1.5, c: 'var(--danger)', label: '超出 1.5 h' }],
      rest: '休息受影響：21:00 的自由時間被占用 30 分鐘。', restBg: 'var(--danger-soft)',
    };
  }
  const base = { known: true, tone: 'success' as const, avail: '9.0', deltaLabel: '尚可安排', deltaColor: 'var(--sage-700)', rest: '休息時段都保住了，22:30 可以準時關燈。', restBg: 'var(--dusk-100)' };
  if (applied) {
    return { ...base, status: '已重新安排', sched: '9.0', delta: '0.0', segs: [{ flex: 9, c: 'var(--sky-500)', label: '已排定' }, { flex: 0.0001, c: 'var(--paper-3)', label: '尚可安排 0 h' }] };
  }
  return { ...base, status: '剛剛好', sched: '7.5', delta: '1.5', segs: [{ flex: 7.5, c: 'var(--sky-500)', label: '已排定' }, { flex: 1.5, c: 'var(--paper-3)', label: '尚可安排 1.5 h' }] };
}

export interface ScheduleEvent { t: string; e: string; title: string; cat: CategoryKey; sub: string; now?: boolean; temp?: boolean; conflict?: string }
export function eventsFor(scenario: Scenario): ScheduleEvent[] {
  const overload = scenario === 'overload';
  return [
    { t: '07:00', e: '07:30', title: '晨間散步', cat: 'personal', sub: '河堤' },
    { t: '09:00', e: '10:00', title: '子公司週會・業務進度', cat: 'work', sub: '天意能創 · 會議室 B' },
    { t: '10:30', e: '12:00', title: '10 月營收對帳', cat: 'work', sub: '專注時段', now: true },
    { t: '12:00', e: '13:00', title: '午餐・午休', cat: 'rest', sub: '離開座位' },
    { t: '14:00', e: '15:00', title: '與會計師確認 Q3 營業稅', cat: 'work', sub: '線上會議' },
    { t: '15:30', e: '17:00', title: 'Q4 預算差異分析', cat: 'work', sub: '週三董事會用' },
    ...(overload ? [{ t: '17:00', e: '18:30', title: '現金流週報', cat: 'work' as const, sub: '董事長交辦', temp: true }] : []),
    { t: '18:30', e: '19:30', title: '晚餐・洗衣服', cat: 'chores', sub: '家裡' },
    { t: '20:00', e: '20:30', title: '和另一半散步聊天', cat: 'couple', sub: '不看手機' },
    { t: '21:00', e: '22:00', title: '自由時間', cat: 'rest', sub: '22:30 關燈', conflict: overload ? '21:00–21:30 被報表收尾占用' : undefined },
  ];
}


export interface LifeItem { title: string; meta: string; cat: CategoryKey; kind: string }
export const LIFE: LifeItem[] = [
  { title: '換床單、洗被套', meta: '每兩週一次', cat: 'chores', kind: '家務' },
  { title: '繳信用卡帳單', meta: '10/27 到期 · 自動扣款未設定', cat: 'money', kind: '帳單' },
  { title: '預約健保卡換發', meta: '線上申請 · 5 分鐘', cat: 'personal', kind: '個人行政' },
  { title: '和另一半訂週末的餐廳', meta: '週三前', cat: 'couple', kind: '夫妻' },
  { title: '讀《財報就像一本故事書》20 頁', meta: '目標：今年讀 12 本書 · 下一步', cat: 'personal', kind: '目標' },
];

export const CARE: { title: string; min: string; icon: IconName }[] = [
  { title: '喝一杯溫水', min: '3 分鐘', icon: 'cup-soda' },
  { title: '起身伸展肩頸', min: '5 分鐘', icon: 'person-standing' },
  { title: '睡前寫三行日記', min: '10 分鐘', icon: 'pen-line' },
];

export const RESCHEDULE_SUGGESTIONS = [
  { title: '「更新 Q4 業績追蹤表」移到週二 09:00', meta: '本週內完成即可 · 省 45 分鐘' },
  { title: '「Q4 預算差異分析」先做 60 分鐘', meta: '剩下 30 分鐘排到週二下午' },
  { title: '保留 21:00 的休息時段', meta: '現金流週報在 18:30 前收尾' },
];

// ── 目標 ─────────────────────────────────────────────────────────────────
export interface Goal {
  id: string; area: AreaKey; title: string; why: string; pct: number; yearMeta: string;
  /** This month's milestone. */
  milestone: { title: string; meta: string; pct: number };
  /** This week's actions: [action, frequency / owner]. */
  week: [string, string][];
  today: string; todayWhere: string;
  /** Jan–Sep: whether the goal was worked on that month. */
  strip: boolean[];
}
const s = (...v: number[]) => v.map(Boolean);
export const GOALS: Goal[] = [
  { id: 'g5', area: 'chores', title: '建立兩人家務輪值，週末不用補做', why: '週末留給兩個人', pct: 55, yearMeta: '輪值表使用第 6 個月', milestone: { title: '衣櫃換季整理', meta: '10 月 · 2 / 3 個衣櫃', pct: 66 }, week: [['換床單、洗被套', '週一 · 我'], ['清冰箱', '週四 · 另一半'], ['倒資源回收', '週二、週五 · 輪流']], today: '換床單、洗被套', todayWhere: '已放進今日 · 生活待辦', strip: s(0, 0, 0, 0, 1, 1, 1, 0, 1) },
  { id: 'g6', area: 'chores', title: '年底前清掉儲藏室 30% 雜物', why: '讓露營用品拿得到', pct: 20, yearMeta: '已清 6%', milestone: { title: '整理露營用品區', meta: '10 月 · 拍照 8 / 20 件', pct: 40 }, week: [['拍照上架二手 5 件', '週六 · 30 分鐘']], today: '今天沒有排，週六再做', todayWhere: '週六會出現在生活待辦', strip: s(0, 0, 0, 0, 0, 0, 0, 1, 1) },
  { id: 'g1', area: 'personal', title: '今年讀完 12 本書', why: '睡前留給自己的時間', pct: 75, yearMeta: '9 / 12 本', milestone: { title: '讀完《財報就像一本故事書》', meta: '已讀 140 / 220 頁', pct: 64 }, week: [['睡前讀 20 頁', '每天 · 本週 5 次']], today: '讀 20 頁 · 22:00', todayWhere: '已放進今日 · 生活待辦', strip: s(1, 1, 0, 1, 1, 1, 0, 1, 1) },
  { id: 'g2', area: 'personal', title: '體脂降到 22%', why: '來年做健檢前', pct: 40, yearMeta: '25.6% → 24.1%', milestone: { title: '10 月底到 23.5%', meta: '還差 0.6%', pct: 60 }, week: [['晨走 30 分鐘', '5 次 · 07:00'], ['重訓 45 分鐘', '2 次 · 尚未排入']], today: '晨走 30 分鐘', todayWhere: '07:00 已完成', strip: s(1, 0, 1, 1, 0, 1, 1, 1, 0) },
  { id: 'g3', area: 'family', title: '12 月和另一半去日本旅行', why: '結婚五週年', pct: 35, yearMeta: '規劃中', milestone: { title: '訂好機票與住宿', meta: '10 月 31 日前', pct: 50 }, week: [['一起比較機票', '週三 21:00 · 兩人'], ['訂週末約會餐廳', '週三前']], today: '訂週末的餐廳 · 10 分鐘', todayWhere: '已放進今日 · 生活待辦', strip: s(0, 0, 0, 0, 0, 0, 1, 1, 1) },
  { id: 'g4', area: 'family', title: '每週和爸媽視訊一次', why: '爸媽住台中', pct: 83, yearMeta: '43 / 52 週', milestone: { title: '10 月視訊 4 次', meta: '已 3 次', pct: 75 }, week: [['週日晚上視訊', '週日 19:30']], today: '今天沒有排，週日再視訊', todayWhere: '週日會出現在行程', strip: s(1, 1, 1, 1, 0, 1, 1, 1, 1) },
];
/** Week actions already done at load, keyed `${goalId}-${index}`. */
export const INITIAL_WEEK_DONE: Record<string, boolean> = { 'g2-0': true };
/** Index of the current month (0 = Jan). Months before it are history, after it are future. */
export const CURRENT_MONTH = 9;

// ── 本週 ─────────────────────────────────────────────────────────────────
/** [weekday, date, scheduled hours, available hours]. */
export const WEEK_DAYS: [string, string, number, number][] = [
  ['一', '10/26', 10.5, 9], ['二', '10/27', 8, 9], ['三', '10/28', 9.5, 9], ['四', '10/29', 7, 9],
  ['五', '10/30', 8.5, 9], ['六', '10/31', 3, 6], ['日', '11/1', 2, 6],
];
export const WEEK_CHART_MAX_HOURS = 12;
export const WEEK_SQUEEZED: { t: string; meta: string; state: string; tone: BadgeTone }[] = [
  { t: '更新 Q4 業績追蹤表', meta: '週一 → 週二 09:00', state: '已移走', tone: 'info' },
  { t: '週三 21:00 自由時間', meta: '被董事會資料準備占用 60 分鐘', state: '被占用', tone: 'danger' },
  { t: '重訓 45 分鐘 × 2', meta: '體脂目標 · 本週還沒排進行程', state: '待安排', tone: 'warning' },
];
export const WEEK_DATES = [
  { d: '10/27 週二', t: '繳信用卡帳單', c: 'var(--area-money)' },
  { d: '10/28 週三', t: '董事會 · 財務摘要', c: 'var(--sky-500)' },
  { d: '10/30 週五', t: '子公司應收帳款月報', c: 'var(--sky-500)' },
  { d: '10/31 週六', t: '日本機票早鳥截止', c: 'var(--fox-500)' },
  { d: '11/1 週日', t: '和爸媽視訊', c: 'var(--fox-500)' },
];

// ── 本月 ─────────────────────────────────────────────────────────────────
export const MONTH = { year: 2026, month: 10, today: 26 };
/** Load level per day: 1 輕鬆 · 2 適中 (default) · 3 偏滿 · 4 超載. */
export const MONTH_LOADS: Record<number, 1 | 2 | 3 | 4> = {
  6: 4, 13: 4, 21: 4, 26: 4, 28: 4, 7: 3, 14: 3, 20: 3, 27: 3, 30: 3,
  3: 1, 4: 1, 10: 1, 11: 1, 17: 1, 18: 1, 24: 1, 25: 1, 31: 1,
};
export const MONTH_LABELS: Record<number, string> = {
  5: '月初結帳', 10: '發薪', 15: '營業稅申報', 17: '兩人約會', 23: '衣櫃換季', 26: '今天',
  27: '信用卡帳單', 28: '董事會', 30: '應收帳款月報', 31: '機票截止',
};
export const LOAD_BG: Record<1 | 2 | 3 | 4, string> = { 1: 'var(--paper-0)', 2: 'var(--sky-100)', 3: 'var(--sky-300)', 4: 'var(--danger-soft)' };
export const LOAD_LEGEND = [{ level: 1, label: '輕鬆' }, { level: 2, label: '適中' }, { level: 3, label: '偏滿' }, { level: 4, label: '超載' }] as const;

// ── 今年 ─────────────────────────────────────────────────────────────────
/** Overloaded days per month, Jan–Dec (Nov/Dec are forecasts). */
export const YEAR_OVERLOAD = [3, 2, 6, 4, 3, 5, 2, 3, 7, 5, 4, 6];
export const YEAR_DATES = [
  { d: '3 月', t: '子公司年度決算', c: 'var(--sky-500)', done: true },
  { d: '7 月', t: '半年度財報', c: 'var(--sky-500)', done: true },
  { d: '9 月', t: 'Q3 結帳', c: 'var(--sky-500)', done: true },
  { d: '11 月', t: '2027 年度預算編列', c: 'var(--sky-500)', done: false },
  { d: '12 月', t: '和另一半去日本', c: 'var(--fox-500)', done: false },
  { d: '12 月', t: '儲藏室清掉 30%', c: 'var(--sage-500)', done: false },
];
