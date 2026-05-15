import { Router } from "express";

import { listDir, readTextFile } from "../lib/filesystem.js";

export const docsRouter = Router();

/**
 * GET /api/docs/tree?root=<rel-path>
 * Returns a single-level directory listing rooted at the given repo-relative
 * path. Default root is `projects/`.
 */
docsRouter.get("/tree", async (req, res) => {
  try {
    const root = String(req.query.root ?? "projects");
    const nodes = await listDir(root);
    res.json({ root, nodes });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

/**
 * GET /api/docs/content?path=<rel-path>
 * Returns raw text content of a markdown / yaml / json file as a JSON body
 * with `{ content, mime, path }`. Refuses non-text files and paths >5 MB.
 */
docsRouter.get("/content", async (req, res) => {
  try {
    const rel = String(req.query.path ?? "");
    if (!rel) {
      res.status(400).json({ error: "Missing path query param." });
      return;
    }
    const result = await readTextFile(rel);
    res.json({ path: rel, ...result });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});
