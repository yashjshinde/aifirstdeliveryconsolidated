import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api, type AgentSummary } from "../api/client";
import { MarkdownView } from "../components/MarkdownView";
import { useProjectContext } from "../components/ProjectContext";

export function AgentPicker() {
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readme, setReadme] = useState<{ name: string; body: string } | null>(null);
  const [readmeLoading, setReadmeLoading] = useState(false);
  const navigate = useNavigate();
  const { project, setAgent } = useProjectContext();

  useEffect(() => {
    setLoading(true);
    api.agents()
      .then(r => setAgents(r.agents))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const pickAgent = (name: string) => {
    setAgent(name);
    navigate("/ready");
  };

  const peekReadme = async (name: string) => {
    setReadmeLoading(true);
    setReadme(null);
    try {
      const body = await api.agentReadme(name);
      setReadme({ name, body });
    } catch (e) {
      setReadme({ name, body: `*Error loading README: ${String(e)}*` });
    } finally {
      setReadmeLoading(false);
    }
  };

  return (
    <section className="page">
      <h2>Pick an agent</h2>
      <p className="page-desc">
        {project ? <>Project context: <strong>{project}</strong>. </> : <em>No project selected; pick one from the Projects page first.</em>}
      </p>
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      <ul className="card-list">
        {agents.map(a => (
          <li key={a.name} className={`card ${a.folderPresent === false ? "card-unbuilt" : ""}`}>
            <div className="card-title">{a.name}</div>
            <div className="card-meta">{a.maturity ?? "-"} - {a.description ?? ""}</div>
            <div className="card-actions">
              <button onClick={() => pickAgent(a.name)} disabled={a.folderPresent === false}>Select</button>
              <button onClick={() => peekReadme(a.name)}>README</button>
              {a.folderPresent === false && <span className="muted">(folder not present)</span>}
            </div>
          </li>
        ))}
      </ul>
      {readmeLoading && <div className="loading">Loading README...</div>}
      {readme && (
        <div className="readme-pane">
          <h3>README: {readme.name}</h3>
          <MarkdownView source={readme.body} />
        </div>
      )}
    </section>
  );
}
