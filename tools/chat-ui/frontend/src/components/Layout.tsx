import { NavLink, Outlet } from "react-router-dom";

import { useProjectContext } from "./ProjectContext";

export function Layout() {
  const { project, agent, feature } = useProjectContext();
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Spec-Driven Development</h1>
        <nav className="app-nav">
          <NavLink to="/" end>Projects</NavLink>
          <NavLink to="/agents">Agents</NavLink>
          <NavLink to="/ready">Ready</NavLink>
          <NavLink to="/docs">Docs</NavLink>
          <NavLink to="/run">Run</NavLink>
          <NavLink to="/estimation">Estimation</NavLink>
        </nav>
        <div className="app-context">
          <span className="ctx-pill">project: <strong>{project ?? "(none)"}</strong></span>
          <span className="ctx-pill">agent: <strong>{agent ?? "(none)"}</strong></span>
          <span className="ctx-pill">feature: <strong>{feature ?? "(none)"}</strong></span>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <small>chat-ui v0.1.0 - per design/13-chat-ui.md - local single-user only</small>
      </footer>
    </div>
  );
}
