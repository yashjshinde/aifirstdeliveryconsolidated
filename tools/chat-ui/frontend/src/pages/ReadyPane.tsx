import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api, type WorkflowNext, type WorkflowState } from "../api/client";
import { useProjectContext } from "../components/ProjectContext";

export function ReadyPane() {
  const { project, agent, feature, setFeature } = useProjectContext();
  const [features, setFeatures] = useState<string[]>([]);
  const [next, setNext] = useState<WorkflowNext | null>(null);
  const [state, setState] = useState<WorkflowState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!project || !agent) return;
    setLoading(true);
    setError(null);
    api.features(project, agent)
      .then(r => setFeatures(r.features))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [project, agent]);

  useEffect(() => {
    if (!project || !agent || !feature) {
      setNext(null);
      setState(null);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      api.workflowNext(project, agent, feature),
      api.workflowStatus(project, agent, feature).catch(() => null),
    ])
      .then(([n, s]) => {
        setNext(n);
        setState(s);
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [project, agent, feature]);

  const runCommand = (command: string) => {
    if (!project || !agent) return;
    const cleanedCmd = command.split(" ")[0]; // strip flags for run-builder
    const args = command.split(" ").slice(1);
    sessionStorage.setItem("pendingRun", JSON.stringify({ agent, command: cleanedCmd, project, feature, args }));
    navigate("/run");
  };

  if (!project || !agent) {
    return (
      <section className="page">
        <h2>Ready pane</h2>
        <p className="empty">Pick a project + agent first.</p>
      </section>
    );
  }

  return (
    <section className="page">
      <h2>Ready pane</h2>
      <p className="page-desc">Eligible next commands for the active feature on <strong>{agent}</strong>.</p>

      <div className="row">
        <label>Feature:</label>
        <select value={feature ?? ""} onChange={e => setFeature(e.target.value || null)}>
          <option value="">(select)</option>
          {features.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      {feature && next && (
        <>
          <div className="ready-summary">
            <div><strong>Phase:</strong> {next.phase ?? "(none)"}</div>
            <div><strong>Current states:</strong> {(next.currentStates ?? []).join(", ") || "(empty)"}</div>
            <div><strong>Gates:</strong></div>
            <ul>
              {Object.entries(next.gates ?? {}).map(([k, v]) => (
                <li key={k}>{k}: <span className={`gate-${v.status.toLowerCase()}`}>{v.status}</span>{v.ts && ` (${v.ts})`}</li>
              ))}
            </ul>
          </div>

          <h3>Eligible commands</h3>
          <ul className="command-list">
            {next.eligibleCommands.map(c => (
              <li key={c}>
                <button onClick={() => runCommand(c)}>{c}</button>
              </li>
            ))}
          </ul>

          {state?.history && state.history.length > 0 && (
            <>
              <h3>Recent history</h3>
              <ul className="history-list">
                {state.history.slice(-10).reverse().map((h, i) => (
                  <li key={i}><code>{h.command}</code> - <span className="muted">{h.ts} - {h.result}</span></li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}
