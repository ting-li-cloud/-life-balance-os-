// Work data shared by 今日總覽 (工作待辦) and 工作管理. Sample content, not real 天意能創 data.
import type { BadgeTone } from '../ds/Display';
import type { Scenario } from './sample';

/** The sample "today" (Monday) and the last day of this week (Sunday). ISO dates compare as strings. */
export const TODAY = '2026-10-26';
export const WEEK_END = '2026-11-01';

export type ProjectKey = 'finance' | 'sales';
export const PROJECTS: Record<ProjectKey, string> = { finance: '子公司財務', sales: '業務控管' };
export const PROJECT_NAME = '天意能創';

export type Source = '主管交辦' | '臨時交辦' | '例行' | '自己排';
export const SOURCE_TONE: Record<Source, BadgeTone | null> = { 主管交辦: 'info', 臨時交辦: 'warning', 例行: null, 自己排: null };

export interface WorkTask {
  id: string;
  title: string;
  /** Shorter name for tight spots (tags). */
  short?: string;
  project: ProjectKey;
  /** Due date, YYYY-MM-DD. */
  due: string;
  /** Estimated minutes; undefined = not filled in yet (資料尚不足). */
  estimate?: number;
  source: Source;
  /** Who assigned it, for 主管交辦 / 臨時交辦. */
  from?: string;
  /** Short context shown on the home page, e.g. 今天下班前. */
  note: string;
  /** Planned for today: shows in 今日總覽 · 工作待辦. */
  today: boolean;
  done: boolean;
}

export interface WaitingItem {
  id: string;
  who: string;
  initial: string;
  what: string;
  note: string;
  waitedDays?: number;
  /** Follow-up is due today: shows on 今日總覽. */
  followToday: boolean;
  followed: boolean;
}

/** Tasks whose estimate is blank in the 資料尚不足 scenario. */
const NODATA_MISSING = new Set(['t2', 't3', 't4']);

export function initialTasks(scenario: Scenario): WorkTask[] {
  const t = (x: Omit<WorkTask, 'done' | 'today'> & Partial<Pick<WorkTask, 'done' | 'today'>>): WorkTask => ({
    today: false, done: false, ...x,
    estimate: scenario === 'nodata' && NODATA_MISSING.has(x.id) ? undefined : x.estimate,
  });
  return [
    // Planned for today — same order as the 今日總覽 design.
    t({ id: 't1', title: '10 月子公司營收對帳', project: 'finance', due: '2026-10-26', estimate: 90, source: '例行', note: '今天到期', today: true }),
    t({ id: 't2', title: '董事長交辦：現金流週報', short: '現金流週報', project: 'finance', due: '2026-10-26', estimate: 60, source: '臨時交辦', from: '董事長', note: '今天下班前', today: true }),
    t({ id: 't3', title: '審核北區業務費用報銷', short: '北區費用報銷', project: 'sales', due: '2026-10-27', estimate: 30, source: '例行', note: '天意能創-北區', today: true }),
    t({ id: 't4', title: '更新 Q4 業績追蹤表', short: 'Q4 業績追蹤表', project: 'sales', due: '2026-10-30', estimate: 45, source: '自己排', note: '業務控管', today: true }),
    t({ id: 't5', title: '簽核供應商付款單 3 筆', project: 'finance', due: '2026-10-27', estimate: 15, source: '例行', note: '財務', today: true }),
    t({ id: 't6', title: '整理子公司應收帳款月報', project: 'finance', due: '2026-10-30', estimate: 60, source: '例行', note: '本週五到期', today: true }),
    t({ id: 't7', title: '準備週三董事會財務摘要', project: 'finance', due: '2026-10-28', estimate: 90, source: '主管交辦', from: '董事長', note: '本週三', today: true }),
    t({ id: 't8', title: '確認中區新進業務的獎金計算', project: 'sales', due: '2026-11-01', estimate: 20, source: '主管交辦', from: '李經理', note: '本週', today: true }),
    // Rest of the backlog.
    t({ id: 't9', title: '回覆李經理 Q4 業務預算調整', project: 'sales', due: '2026-10-27', estimate: 30, source: '主管交辦', from: '李經理', note: '主管交辦' }),
    t({ id: 't10', title: 'Q4 預算差異分析', project: 'finance', due: '2026-10-28', estimate: 90, source: '自己排', note: '週三董事會用' }),
    t({ id: 't11', title: '子公司 Q3 營業稅資料歸檔', project: 'finance', due: '2026-11-05', source: '例行', note: '會計師要的' }),
    t({ id: 't12', title: '南區客戶拜訪報告彙整', project: 'sales', due: '2026-11-06', estimate: 45, source: '自己排', note: '月初業務會議用' }),
    t({ id: 't13', title: '2027 年度預算編列：子公司版本', project: 'finance', due: '2026-11-16', source: '主管交辦', from: '董事長', note: '11 月中交初稿' }),
    t({ id: 't14', title: '10 月薪資表覆核', project: 'finance', due: '2026-10-23', estimate: 30, source: '例行', note: '已交人資', done: true }),
  ];
}

export const INITIAL_WAITING: WaitingItem[] = [
  { id: 'w1', who: '王會計', initial: '王', what: '9 月沖帳明細', note: '約好今天回覆', waitedDays: 3, followToday: true, followed: false },
  { id: 'w2', who: '南區陳協理', initial: '陳', what: '客戶應收帳齡表', note: '今天中午前要拿到，週三董事會用', followToday: true, followed: false },
  { id: 'w3', who: '會計師事務所', initial: '會', what: 'Q3 營業稅申報草稿', note: '週四前要確認', waitedDays: 5, followToday: false, followed: false },
  { id: 'w4', who: '北區林主任', initial: '林', what: '10 月業務費用單據', note: '費用報銷要用', waitedDays: 2, followToday: false, followed: false },
];

export const waitingMeta = (w: WaitingItem) =>
  [w.followed ? '今天已追蹤' : w.waitedDays ? `已等 ${w.waitedDays} 天` : null, w.note].filter(Boolean).join(' · ');

// ── Helpers ────────────────────────────────────────────────────────────────
const WEEKDAY = ['日', '一', '二', '三', '四', '五', '六'];
export function dayLabel(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${m}/${d} 週${WEEKDAY[new Date(y, m - 1, d).getDay()]}`;
}

export const minutesLabel = (m?: number) => (m === undefined ? '未填工時' : `${m} 分鐘`);
export const hoursLabel = (min: number) => (min / 60).toFixed(1);

export type Bucket = 'today' | 'week' | 'later' | 'done';
/** 今天 = planned today, due today, or overdue. */
export function bucketOf(t: WorkTask): Bucket {
  if (t.done) return 'done';
  if (t.today || t.due <= TODAY) return 'today';
  if (t.due <= WEEK_END) return 'week';
  return 'later';
}

export function dueBadge(t: WorkTask): { label: string; tone: BadgeTone } | null {
  if (t.done) return null;
  if (t.due < TODAY) return { label: '已逾期', tone: 'danger' };
  if (t.due === TODAY) return { label: '今天到期', tone: 'danger' };
  return null;
}

/** Meta line for the home page: the short note plus the estimate. */
export const homeMeta = (t: WorkTask) => `${t.note} · ${minutesLabel(t.estimate)}`;

/** Parse "約 60 分鐘" / "1.5 小時" out of free text, for 臨時交辦. */
export function parseEstimate(text: string): number | undefined {
  const h = text.match(/(\d+(?:\.\d+)?)\s*(小時|h)/i);
  if (h) return Math.round(Number(h[1]) * 60);
  const m = text.match(/(\d+)\s*(分鐘|分|min)/i);
  return m ? Number(m[1]) : undefined;
}

export const ESTIMATE_CHOICES = [15, 30, 45, 60, 90];
