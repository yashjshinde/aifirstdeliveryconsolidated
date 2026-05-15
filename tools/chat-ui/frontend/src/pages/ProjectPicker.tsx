import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/client";
import { useProjectContext } from "../components/ProjectContext";

export function ProjectPicker() {
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setProject } = useProjectContext();

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.projects()
      .then(r => setProjects(r.projects))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const pick = (name: string) => {
    setProject(name);
    navigate("/agents");
  };

  return (
    <section className="page">
      <h2>Pick a project</h2>
      <p className="page-desc">Projects live under <code>projects/</code>. Pick one to set the active context for downstream views.</p>
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && projects.length === 0 && (
        <div className="empty">No projects found. Use <code>tools/scaffold/New-Project.ps1</code> to create one.</div>
      )}
      <ul className="card-list">
        {projects.map(p => (
          <li key={p} className="card" onClick={() => pick(p)}>
            <div className="card-title">{p}</div>
            <div className="card-meta">click to select</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
