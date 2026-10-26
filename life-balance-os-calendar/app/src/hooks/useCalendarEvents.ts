import { useEffect, useMemo, useState } from 'react';
import {
  GOOGLE_CALENDAR, SOURCES, isoLocal, parseEvents, sampleEvents,
  type CalEvent, type GEvent, type GPage, type SourceId,
} from '../data/calendar';
import { ACCESS_CODES, getMcp, type Mcp, type McpError } from '../lib/claudeMcp';

export interface SourceState {
  status: 'loading' | 'ok' | 'error';
  events: CalEvent[];
  error?: McpError;
  /** When the shown data was fetched (epoch ms). */
  at?: number;
  /** More than MAX_PAGES pages: some events were left out. */
  cut?: boolean;
}
export type Mode = 'checking' | 'live' | 'sample';

const MAX_PAGES = 4;
const asPage = (p: unknown): GPage => {
  if (typeof p === 'string') { try { return JSON.parse(p) as GPage; } catch { return {}; } }
  return (p && typeof p === 'object' ? p : {}) as GPage;
};

/**
 * Live events from every calendar in SOURCES for [from, to). Runs only inside claude.ai
 * (the Artifact `mcp` capability); anywhere else it returns sample events (mode "sample").
 */
export function useCalendarEvents(from: Date, to: Date) {
  const [mcp, setMcp] = useState<Mcp | null | undefined>(undefined);
  const [states, setStates] = useState<Partial<Record<SourceId, SourceState>>>({});
  const fromKey = isoLocal(from), toKey = isoLocal(to);

  useEffect(() => { getMcp().then(setMcp); }, []);

  useEffect(() => {
    if (!mcp) return;
    let alive = true;
    const set = (id: SourceId, patch: Partial<SourceState>) =>
      alive && setStates((s) => ({ ...s, [id]: { status: 'loading', events: [], ...s[id], ...patch } as SourceState }));
    setStates(Object.fromEntries(SOURCES.map((s) => [s.id, { status: 'loading', events: [] }])));

    const unsubs = SOURCES.map((src) => {
      const input = { calendarId: src.calendarId, startTime: fromKey, endTime: toKey, orderBy: 'startTime', pageSize: 250 };
      let seq = 0;
      return mcp.watchTool(GOOGLE_CALENDAR, 'list_events', input, async (ev) => {
        const mine = ++seq;
        if (ev.type === 'error') {
          // Access problems retract the data; passing failures keep the last good events.
          set(src.id, ACCESS_CODES.has(ev.error.code) ? { status: 'error', events: [], error: ev.error } : { status: 'error', error: ev.error });
          return;
        }
        let page = asPage(ev.result.payload);
        if (page.error) { set(src.id, { status: 'error', error: { code: 'tool_error', message: page.error.message ?? '' } }); return; }
        const raw: GEvent[] = [...(page.events ?? [])];
        let pages = 1, cut = false;
        try {
          while (page.nextPageToken) {
            if (pages >= MAX_PAGES) { cut = true; break; }
            page = asPage((await mcp.callTool(GOOGLE_CALENDAR, 'list_events', { ...input, pageToken: page.nextPageToken })).payload);
            raw.push(...(page.events ?? []));
            pages++;
          }
        } catch { cut = true; }
        if (mine !== seq) return; // a newer delivery arrived meanwhile
        set(src.id, { status: 'ok', events: parseEvents(src.id, raw), error: undefined, at: ev.result.cache?.storedAt ?? Date.now(), cut });
      }, { cache: { staleTime: 60_000 }, refetchInterval: 5 * 60_000 });
    });
    return () => { alive = false; unsubs.forEach((u) => u()); };
  }, [mcp, fromKey, toKey]);

  const mode: Mode = mcp === undefined ? 'checking' : mcp ? 'live' : 'sample';

  const sample = useMemo(() => {
    const s = sampleEvents(new Date());
    return Object.fromEntries(SOURCES.map((x) => [x.id, { status: 'ok', events: s[x.id] ?? [] }])) as Record<SourceId, SourceState>;
  }, []);

  const refresh = () => mcp?.invalidate(GOOGLE_CALENDAR, 'list_events').catch(() => undefined);
  return { mode, states: mode === 'sample' ? sample : states, refresh };
}
