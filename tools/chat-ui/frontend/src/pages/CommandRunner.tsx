import { useEffect, useRef, useState } from "react";

import { api } from "../api/client";
import { useProjectContext } from "../components/ProjectContext";

interface LogLine {
  kind: "stdout" | "stderr" | "exit" | "error" | "info";
  ts: string;
  text: string;
}

export function CommandRunner() {
  const { project, agent, feature, setProject, setAgent, setFeature } = useProjectContext();
  const [command, setCommand] = useState<string>("/status");
  const [args, setArgs] = useState<string>("");
  const [runId, setRunId] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const [lines, setLines] = useState<LogLine[]>([]);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const logRef = useRef<HTMLPreElement | null>(null);

  // Replay queued run from ReadyPane
  useEffect(() => {
    const pending = sessionStorage.getItem("pendingRun");
    if (!pending) return;
    sessionStorage.removeItem("pendingRun");
    try {
      const parsed = JSON.parse(pending) as { agent: string; command: string; project?: string; feature?: string; args?: string[] };
      if (parsed.project) setProject(parsed.project);
      if (parsed.agent) setAgent(parsed.agent);
      if (parsed.feature) setFeature(parsed.feature);
      setCommand(parsed.command);
      setArgs((parsed.args ?? []).join(" "));
    } catch (err) {
      console.warn("Failed to replay pending run", err);
    }
    // intentionally one-time on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [lines]);

  const append = (kind: LogLine["kind"], text: string) => {
    setLines(prev => [...prev, { kind, ts: new Date().toISOString(), text }]);
  };

  const run = async () => {
    if (!agent) {
      append("error", "Cannot run -- no agent selected.");
      return;
    }
    if (busy) return;
    setBusy(true);
    setExitCode(null);
    setLines([]);
    try {
      const descriptor = await api.runCommand({
        agent,
        command,
        ...(project ? { project } : {}),
        ...(feature ? { feature } : {}),
        args: args.trim() ? args.trim().split(/\s+/) : [],
      });
      setRunId(descriptor.runId);
      append("info", `Started run ${descriptor.runId} -- ${descriptor.promptString}`);
      const es = api.openStream(descriptor.runId);
      sseRef.current = es;
      es.addEventListener("stdout", (ev: MessageEvent) => {
        const parsed = JSON.parse(ev.data) as { data?: string };
        if (parsed.data) append("stdout", parsed.data);
      });
      es.addEventListener("stderr", (ev: MessageEvent) => {
        const parsed = JSON.parse(ev.data) as { data?: string };
        if (parsed.data) append("stderr", parsed.data);
      });
      es.addEventListener("exit", (ev: MessageEvent) => {
        const parsed = JSON.parse(ev.data) as { code?: number | null; signal?: string | null };
        setExitCode(parsed.code ?? null);
        append("exit", `Process exited code=${parsed.code} signal=${parsed.signal}`);
        es.close();
        sseRef.current = null;
        setBusy(false);
      });
      es.addEventListener("error", (ev: MessageEvent | Event) => {
        if ("data" in ev) {
          try {
            const parsed = JSON.parse((ev as MessageEvent).data) as { errorMessage?: string };
            if (parsed.errorMessage) append("error", parsed.errorMessage);
          } catch { /* ignore */ }
        }
      });
    } catch (e) {
      append("error", String(e));
      setBusy(false);
    }
  };

  const stop = async () => {
    if (!runId) return;
    try {
      await api.stopRun(runId);
      append("info", `Sent stop signal for ${runId}.`);
    } catch (e) {
      append("error", String(e));
    }
  };

  return (
    <section className="page run-page">
      <h2>Run a command</h2>
      <p className="page-desc">Active context: <strong>{project ?? "(no project)"}</strong> / <strong>{agent ?? "(no agent)"}</strong> / <strong>{feature ?? "(no feature)"}</strong></p>

      <div className="row">
        <label>Command:</label>
        <input value={command} onChange={e => setCommand(e.target.value)} placeholder="/status" />
        <label>Extra args:</label>
        <input value={args} onChange={e => setArgs(e.target.value)} placeholder="--dry-run" />
        <button onClick={run} disabled={busy || !agent}>Run</button>
        <button onClick={stop} disabled={!busy || !runId}>Stop</button>
        {exitCode !== null && <span className={`exit-pill ${exitCode === 0 ? "ok" : "fail"}`}>exit={exitCode}</span>}
      </div>

      <pre ref={logRef} className="run-log">
        {lines.map((l, i) => (
          <div key={i} className={`log-line log-${l.kind}`}>
            <span className="log-ts">{l.ts.slice(11, 19)}</span>{" "}
            <span className="log-kind">[{l.kind}]</span>{" "}
            <span className="log-text">{l.text}</span>
          </div>
        ))}
      </pre>
    </section>
  );
}
