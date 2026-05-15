import { useEffect, useState } from "react";

import { api, type TreeNode } from "../api/client";
import { MarkdownView } from "../components/MarkdownView";
import { useProjectContext } from "../components/ProjectContext";

export function DocumentViewer() {
  const { project } = useProjectContext();
  const [rootPath, setRootPath] = useState<string>("projects");
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [pathStack, setPathStack] = useState<string[]>([]);
  const [content, setContent] = useState<{ path: string; body: string; mime: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Default to project root when one is selected
    const base = project ? `projects/${project}` : "projects";
    setRootPath(base);
    setPathStack([base]);
  }, [project]);

  useEffect(() => {
    if (!rootPath) return;
    setLoading(true);
    setError(null);
    api.docsTree(rootPath)
      .then(r => setTree(r.nodes))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [rootPath]);

  const openNode = async (node: TreeNode) => {
    if (node.type === "directory") {
      setPathStack(prev => [...prev, node.path]);
      setRootPath(node.path);
      setContent(null);
    } else {
      setLoading(true);
      setError(null);
      try {
        const r = await api.docContent(node.path);
        setContent({ path: r.path, body: r.content, mime: r.mime });
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
  };

  const goUp = () => {
    if (pathStack.length <= 1) return;
    const next = pathStack.slice(0, -1);
    setPathStack(next);
    setRootPath(next[next.length - 1]);
    setContent(null);
  };

  return (
    <section className="page docs-page">
      <div className="docs-pane">
        <h2>Browse</h2>
        <div className="breadcrumbs">
          <button onClick={goUp} disabled={pathStack.length <= 1}>Up</button>
          <code>{rootPath}</code>
        </div>
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        <ul className="tree-list">
          {tree.map(n => (
            <li key={n.path} className={`tree-node tree-${n.type}`}>
              <button className="tree-button" onClick={() => openNode(n)}>
                {n.type === "directory" ? "[DIR]" : "[FILE]"} {n.name}
              </button>
              {n.size !== undefined && <span className="muted"> {n.size} B</span>}
            </li>
          ))}
        </ul>
      </div>
      <div className="docs-content">
        {content
          ? (content.mime === "text/markdown"
              ? <MarkdownView source={content.body} title={content.path} />
              : <pre className="raw-content"><code>{content.body}</code></pre>)
          : <div className="empty">Pick a file to view.</div>
        }
      </div>
    </section>
  );
}
