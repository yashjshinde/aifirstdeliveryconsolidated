/**
 * Fetch-based API client. Backed by /api/* on the backend (Vite dev server
 * proxies /api -> localhost:5173).
 */

const BASE = "/api";

async function getJson<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) {
    let body: unknown;
    try { body = await r.json(); } catch { /* ignore */ }
    const msg = (body && typeof body === "object" && body !== null && "error" in body)
      ? String((body as { error: unknown }).error)
      : `HTTP ${r.status}`;
    throw new Error(msg);
  }
  return r.json() as Promise<T>;
}

async function getText(path: string): Promise<string> {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

async function postJson<TRes, TBody>(path: string, body: TBody): Promise<TRes> {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    let parsed: unknown;
    try { parsed = await r.json(); } catch { /* ignore */ }
    const msg = (parsed && typeof parsed === "object" && parsed !== null && "error" in parsed)
      ? String((parsed as { error: unknown }).error)
      : `HTTP ${r.status}`;
    throw new Error(msg);
  }
  return r.json() as Promise<TRes>;
}

export interface AgentSummary {
  name: string;
  version?: string;
  maturity?: string;
  "base-commands"?: boolean;
  "extra-commands"?: string[];
  docScope?: Record<string, string>;
  description?: string;
  folderPresent?: boolean;
}

export interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
}

export interface WorkflowState {
  schemaVersion?: string;
  project?: string;
  agent?: string;
  feature?: string;
  phase?: string;
  currentStates?: string[];
  gates?: Record<string, { status: string; ts?: string; by?: string }>;
  dependencies?: Array<{ agent: string; feature: string; artifact: string; status: string }>;
  history?: Array<{ command: string; ts: string; result: string }>;
}

export interface WorkflowNext {
  eligibleCommands: string[];
  rationale: string;
  gates: Record<string, { status: string; ts?: string; by?: string }>;
  currentStates: string[];
  phase?: string;
}

export interface RunDescriptor {
  runId: string;
  startedAt: string;
  cwd: string;
  cli: string;
  promptString: string;
}

export const api = {
  health: () => getJson<{ status: string; repoRoot: string; time: string }>("/health"),

  projects: () => getJson<{ projects: string[] }>("/projects"),
  project: (name: string) => getJson<{ name: string; config: Record<string, unknown>; agentFolders: string[] }>(`/projects/${encodeURIComponent(name)}`),

  agents: () => getJson<{ agents: AgentSummary[] }>("/agents"),
  agentReadme: (name: string) => getText(`/agents/${encodeURIComponent(name)}/readme`),
  agentCommands: (name: string) => getJson<{ commands: string[] }>(`/agents/${encodeURIComponent(name)}/commands`),

  features: (project: string, agent: string) =>
    getJson<{ features: string[] }>(`/workflow/features?project=${encodeURIComponent(project)}&agent=${encodeURIComponent(agent)}`),
  workflowStatus: (project: string, agent: string, feature: string) =>
    getJson<WorkflowState>(`/workflow/status?project=${encodeURIComponent(project)}&agent=${encodeURIComponent(agent)}&feature=${encodeURIComponent(feature)}`),
  workflowNext: (project: string, agent: string, feature: string) =>
    getJson<WorkflowNext>(`/workflow/next?project=${encodeURIComponent(project)}&agent=${encodeURIComponent(agent)}&feature=${encodeURIComponent(feature)}`),

  docsTree: (root: string) =>
    getJson<{ root: string; nodes: TreeNode[] }>(`/docs/tree?root=${encodeURIComponent(root)}`),
  docContent: (path: string) =>
    getJson<{ path: string; content: string; mime: string }>(`/docs/content?path=${encodeURIComponent(path)}`),

  runCommand: (body: { agent: string; command: string; project?: string; feature?: string; args?: string[] }) =>
    postJson<RunDescriptor, typeof body>("/commands/run", body),
  stopRun: (runId: string) => postJson<{ ok: boolean }, Record<string, never>>(`/commands/${encodeURIComponent(runId)}/stop`, {}),
  listRuns: () => getJson<{ runs: Array<Omit<RunDescriptor, "promptString"> & { command: string; args: string[]; endedAt?: string; exitCode?: number | null }> }>("/commands/runs"),

  /** Open an SSE connection for a given run; caller manages lifetime. */
  openStream(runId: string): EventSource {
    return new EventSource(`${BASE}/stream/${encodeURIComponent(runId)}`);
  },
};
