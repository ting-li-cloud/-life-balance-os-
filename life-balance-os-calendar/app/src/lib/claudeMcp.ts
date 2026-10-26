// Minimal typed access to the claude.ai Artifact runtime's `mcp` capability (contract 0.2.67).
// Present only when the app runs as a published Artifact in claude.ai; null everywhere else.

export interface McpError { code: string; server?: string; message: string; retryable?: boolean; retryAfterMs?: number }
export interface CallToolResult { payload?: unknown; cache?: { storedAt: number; revalidating: boolean } }
export type WatchEvent = { type: 'data'; result: CallToolResult } | { type: 'error'; error: McpError };

export interface Mcp {
  callTool(server: string, tool: string, input?: unknown, options?: { cache?: false | { staleTime?: number; refresh?: boolean } }): Promise<CallToolResult>;
  watchTool(server: string, tool: string, input: unknown, handler: (ev: WatchEvent) => void, options?: { cache?: { staleTime?: number; gcTime?: number }; refetchInterval?: number }): () => void;
  invalidate(server?: string, tool?: string, input?: unknown): Promise<void>;
}

interface ClaudeRuntime { use(name: 'mcp'): Promise<Mcp | null> }

let cached: Promise<Mcp | null> | null = null;

export function getMcp(): Promise<Mcp | null> {
  if (cached) return cached;
  const claude = (window as unknown as { claude?: ClaudeRuntime }).claude;
  cached = claude?.use ? claude.use('mcp').catch(() => null) : Promise.resolve(null);
  return cached;
}

/** Errors that mean "this viewer can't read Google Calendar here" rather than a passing failure. */
export const ACCESS_CODES = new Set(['needs_reauth', 'server_not_connected', 'selection_required', 'not_in_manifest', 'blocked_by_policy', 'approval_required', 'not_granted', 'capability_disabled', 'capability_removed', 'consent_required']);

export function accessMessage(code: string, server: string): string {
  switch (code) {
    case 'needs_reauth': return `${server} 的連線已過期。請到 claude.ai「設定 → 連接器」重新連接。`;
    case 'server_not_connected': return `還沒有連接 ${server}。請到 claude.ai「設定 → 連接器」新增。`;
    case 'selection_required': return `你有不只一個 ${server} 連接器，請在提示中選擇要用哪一個。`;
    case 'not_in_manifest': case 'consent_required': return `這個頁面還沒獲准讀取 ${server}。可以在頁面的權限選單中允許。`;
    case 'blocked_by_policy': case 'approval_required': return `組織政策不允許這個頁面讀取 ${server}。`;
    default: return `這裡無法讀取 ${server}。`;
  }
}
