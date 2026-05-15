import DOMPurify from "dompurify";
import { marked } from "marked";
import mermaid from "mermaid";
import { useEffect, useMemo, useRef } from "react";

mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "strict" });

interface Props {
  source: string;
  /** Optional title shown above the rendered body. */
  title?: string;
}

export function MarkdownView({ source, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const html = useMemo(() => {
    // Strip YAML frontmatter; show collapsed if present
    let body = source;
    let frontmatter: string | null = null;
    const fmMatch = /^---\n([\s\S]*?)\n---\n/.exec(source);
    if (fmMatch) {
      frontmatter = fmMatch[1];
      body = source.slice(fmMatch[0].length);
    }

    const raw = marked.parse(body, { async: false }) as string;
    const safe = DOMPurify.sanitize(raw, {
      ADD_TAGS: ["pre", "code"],
      ADD_ATTR: ["class"],
    });
    const safeFm = frontmatter
      ? `<details class="frontmatter"><summary>Frontmatter</summary><pre><code>${escapeHtml(frontmatter)}</code></pre></details>`
      : "";
    return safeFm + safe;
  }, [source]);

  useEffect(() => {
    if (!containerRef.current) return;
    const nodes = Array.from(containerRef.current.querySelectorAll<HTMLElement>("pre code.language-mermaid"));
    if (nodes.length === 0) return;
    let cancelled = false;
    void (async () => {
      for (let i = 0; i < nodes.length; i++) {
        const codeEl = nodes[i];
        const src = codeEl.textContent ?? "";
        const id = `mermaid-render-${Date.now()}-${i}`;
        try {
          const { svg } = await mermaid.render(id, src);
          if (cancelled) return;
          const wrapper = document.createElement("div");
          wrapper.className = "mermaid-rendered";
          wrapper.innerHTML = svg;
          codeEl.parentElement?.replaceWith(wrapper);
        } catch (err) {
          codeEl.classList.add("mermaid-error");
          codeEl.title = String(err);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [html]);

  return (
    <div className="markdown-view">
      {title && <h2 className="md-title">{title}</h2>}
      <div ref={containerRef} className="md-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
