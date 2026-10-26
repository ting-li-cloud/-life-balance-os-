// 行事曆: the Google Calendars shown on the calendar page, and how their events are merged.
// The same calendars feed 李總行程整合看板 (DASHBOARD_URL).

export const DASHBOARD_URL = 'https://claude.ai/artifact/9Cg9uHSHwiLpPonCHeabVY';
export const GOOGLE_CALENDAR = 'Google Calendar';

export type SourceId = 'me' | 'gm' | 'att' | 'room' | 'energy' | 'slx' | 'spv';
export interface CalendarSource { id: SourceId; name: string; calendarId: string; c: string; soft: string }

/** Order = merge priority: when two calendars hold the same event, the earlier one's details win. */
export const SOURCES: CalendarSource[] = [
  { id: 'me', name: '個人行事曆', calendarId: 'ting-li@prosperwin.com.tw', c: 'var(--fox-500)', soft: 'var(--fox-100)' },
  { id: 'gm', name: '李總行程', calendarId: 'c_58faed24750b5bec7a74f41adedb5e6182085cc904b913cbef050a35d74c7798@group.calendar.google.com', c: 'var(--saffron-500)', soft: 'var(--saffron-100)' },
  { id: 'room', name: '會議室租借', calendarId: 'c_647782fd5b7442437b299fe04fb4be1869f8a96eccbde63401c0c9c741e4e839@group.calendar.google.com', c: 'var(--dusk-500)', soft: 'var(--dusk-100)' },
  { id: 'att', name: '出勤', calendarId: '24d9216d7ddd72e3d57e41a7a1ac25319bdd75ff13313d9a72b4b8ffe27e4d6c@group.calendar.google.com', c: 'var(--sage-500)', soft: 'var(--sage-100)' },
  { id: 'energy', name: '能源部業務', calendarId: 'c_718b10d8460bf2fedaca000b562c757737239ab49385f85940de25133a6a470d@group.calendar.google.com', c: 'var(--sky-500)', soft: 'var(--sky-100)' },
  { id: 'slx', name: '山林旭業務', calendarId: 'c_n1gmtrvn0sdk8essdgsr3k5jt8@group.calendar.google.com', c: 'var(--sky-700)', soft: 'var(--sky-100)' },
  { id: 'spv', name: '能源SPV', calendarId: 'b6uipq55q7u8lu7csq3s0ls7j1c8t6rt@import.calendar.google.com', c: 'var(--area-money)', soft: 'var(--paper-2)' },
];
export const SOURCE_BY_ID = Object.fromEntries(SOURCES.map((s) => [s.id, s])) as Record<SourceId, CalendarSource>;

export interface CalEvent {
  key: string;
  /** Every calendar that holds this event, highest priority first. */
  sources: SourceId[];
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location: string;
  description: string;
  attendees: string[];
  link: string;
  /** Marked "free" (transparent) in Google Calendar: never counts as a conflict. */
  free: boolean;
  recurring: boolean;
}

// ── Dates (local time, weeks start Monday) ──────────────────────────────────
export const WD = ['日', '一', '二', '三', '四', '五', '六'];
export const pad = (n: number) => String(n).padStart(2, '0');
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k: string) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const startOfWeek = (d: Date) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const hm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
export const md = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
export const isoLocal = (d: Date) => `${dayKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

export function timeLabel(e: CalEvent) {
  if (e.allDay) {
    const last = addDays(e.end, -1);
    return dayKey(last) !== dayKey(e.start) ? `全天 · ${md(e.start)}–${md(last)}` : '全天';
  }
  return dayKey(e.start) === dayKey(new Date(e.end.getTime() - 1)) ? `${hm(e.start)}–${hm(e.end)}` : `${hm(e.start)}–${md(e.end)} ${hm(e.end)}`;
}

/** Events touching the day `d`. */
export const onDay = (events: CalEvent[], d: Date) => {
  const a = startOfDay(d).getTime(), b = addDays(d, 1).getTime();
  return events.filter((e) => e.start.getTime() < b && e.end.getTime() > a);
};

// ── Google Calendar list_events answer → events ──────────────────────────────
interface GDate { dateTime?: string; date?: string }
export interface GEvent {
  id?: string; summary?: string; description?: string; location?: string; status?: string; transparency?: string;
  htmlLink?: string; recurringEventId?: string; start?: GDate; end?: GDate;
  attendees?: { displayName?: string; email?: string; resource?: boolean; self?: boolean }[];
}
export interface GPage { events?: GEvent[]; nextPageToken?: string; error?: { message?: string } }

const toDate = (g?: GDate) => (g?.dateTime ? new Date(g.dateTime) : g?.date ? fromKey(g.date.slice(0, 10)) : null);

export function parseEvents(src: SourceId, raw: GEvent[]): CalEvent[] {
  const out: CalEvent[] = [];
  for (const e of raw) {
    if (e.status === 'cancelled') continue;
    const start = toDate(e.start);
    if (!start || Number.isNaN(start.getTime())) continue;
    const allDay = !e.start?.dateTime;
    let end = toDate(e.end);
    if (!end || Number.isNaN(end.getTime()) || end <= start) end = allDay ? addDays(start, 1) : new Date(start.getTime() + 30 * 60e3);
    out.push({
      key: `${src}:${e.id ?? start.getTime()}`, sources: [src], title: (e.summary ?? '').trim() || '（無標題）', start, end, allDay,
      location: e.location ?? '', description: (e.description ?? '').trim(),
      attendees: (e.attendees ?? []).filter((a) => !a.resource && !a.self).map((a) => a.displayName || a.email || '').filter(Boolean),
      link: e.htmlLink ?? '', free: e.transparency === 'transparent', recurring: Boolean(e.recurringEventId),
    });
  }
  return out;
}

const norm = (s: string) => s.replace(/[\s\-_·・:：|｜()（）[\]【】]/g, '').toLowerCase();

/** Merge the same event held by several calendars (same title, start and end) into one. */
export function mergeEvents(bySource: Partial<Record<SourceId, CalEvent[]>>): CalEvent[] {
  const merged = new Map<string, CalEvent>();
  for (const s of SOURCES) {
    for (const e of bySource[s.id] ?? []) {
      const k = `${norm(e.title)}|${e.start.getTime()}|${e.end.getTime()}|${e.allDay}`;
      const have = merged.get(k);
      if (have) { if (!have.sources.includes(s.id)) have.sources.push(s.id); }
      else merged.set(k, { ...e, sources: [...e.sources] });
    }
  }
  return [...merged.values()].sort((a, b) => a.start.getTime() - b.start.getTime() || Number(b.allDay) - Number(a.allDay) || a.title.localeCompare(b.title));
}

export interface Conflict { a: CalEvent; b: CalEvent; from: Date; to: Date; who: string }

/** Whose day a conflict is about. Team and room calendars hold other people's time, so they are left out. */
export const CONFLICT_OWNERS: { who: string; source: SourceId }[] = [
  { who: '你的行程', source: 'me' },
  { who: '李總行程', source: 'gm' },
];

/** Overlapping timed events within one person's calendar (ignoring ones marked free). */
export function findConflicts(events: CalEvent[]): Conflict[] {
  return CONFLICT_OWNERS.flatMap(({ who, source }) => overlaps(events.filter((e) => e.sources.includes(source)), who));
}

function overlaps(events: CalEvent[], who: string): Conflict[] {
  const timed = events.filter((e) => !e.allDay && !e.free);
  const out: Conflict[] = [];
  for (let i = 0; i < timed.length; i++) {
    for (let j = i + 1; j < timed.length; j++) {
      const a = timed[i], b = timed[j];
      if (b.start >= a.end) break;
      out.push({ a, b, from: b.start, to: a.end < b.end ? a.end : b.end, who });
    }
  }
  return out;
}

// ── Sample events, shown only when Google Calendar can't be reached ────────────
/** Clearly fictional placeholder events around `today`, so the page is not empty when offline. */
export function sampleEvents(today: Date): Partial<Record<SourceId, CalEvent[]>> {
  const mon = startOfWeek(today);
  const at = (dayOffset: number, h: number, m = 0) => { const d = addDays(mon, dayOffset); d.setHours(h, m); return d; };
  const ev = (src: SourceId, n: number, title: string, start: Date, end: Date, extra: Partial<CalEvent> = {}): CalEvent => ({
    key: `sample-${src}-${n}`, sources: [src], title, start, end, allDay: false, location: '', description: '', attendees: [], link: '', free: false, recurring: false, ...extra,
  });
  return {
    me: [
      ev('me', 1, '子公司週會・業務進度', at(0, 9), at(0, 10), { location: '會議室 B' }),
      ev('me', 2, '10 月營收對帳（專注時段）', at(0, 10, 30), at(0, 12)),
      ev('me', 3, '與會計師確認 Q3 營業稅', at(0, 14), at(0, 15), { location: '線上會議' }),
      ev('me', 4, 'Q4 預算差異分析', at(0, 15, 30), at(0, 17)),
      ev('me', 5, '董事會財務摘要定稿', at(1, 13, 30), at(1, 15)),
      ev('me', 6, '供應商付款覆核', at(3, 10), at(3, 11)),
    ],
    gm: [
      ev('gm', 1, '董事會', at(2, 9, 30), at(2, 12), { location: '14F 大會議室' }),
      ev('gm', 2, '子公司營運會議', at(4, 10), at(4, 11, 30)),
    ],
    room: [
      ev('room', 1, '董事會', at(2, 9, 30), at(2, 12), { location: '14F 大會議室' }),
      ev('room', 2, '業務部週會', at(1, 14), at(1, 15, 30), { location: '14F 小會議室' }),
    ],
    att: [ev('att', 1, '台中出差', addDays(mon, 3), addDays(mon, 4), { allDay: true })],
    energy: [ev('energy', 1, '案場勘查', at(1, 14, 30), at(1, 16, 30))],
    slx: [ev('slx', 1, '客戶拜訪', at(4, 14), at(4, 16))],
    spv: [ev('spv', 1, 'SPV 設立文件送件', addDays(mon, 4), addDays(mon, 5), { allDay: true })],
  };
}
