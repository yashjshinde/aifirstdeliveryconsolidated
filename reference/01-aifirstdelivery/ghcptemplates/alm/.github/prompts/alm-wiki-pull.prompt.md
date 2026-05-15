---
mode: agent
description: "Pull a document from Azure DevOps Wiki to a local file. Triggers on: 'pull from wiki', 'download wiki page', 'wiki-pull'."
---

Pull a document from Azure DevOps Wiki to a local file.

## Usage

```
/alm-wiki-pull {wiki-path}
```

Where `{wiki-path}` is the full wiki page path, e.g. `/Delivery/account-loyalty-points/spec`

## Steps

1. Read `constitution/10-alm-configuration.md` — load: wiki-root, domain paths.
2. Call MCP tool `ado_wiki_pull`:
   - `path`: {wiki-path}
3. Extract the `content` field from the result.
4. Derive the local file path:
   - Strip the wiki-root prefix from the wiki path.
   - The remaining segments map to `{domain}/{feature}/{doc}`.
   - Map `{doc}` to a local filename (spec.md, fdd.md, tdd.md, blueprint.md, test-plan-and-strategy.md).
   - Construct the full local path from the domain path in the constitution.
   - If the mapping cannot be determined, ask the user for the target local file path.
5. If the local file exists, show a brief diff summary before writing.
6. Write the content to the local file.
7. Print:

```
WIKI PULL
═════════════════════════════════
Wiki path  : {wiki-path}
Local file : {local-path}
Action     : {Created | Updated}
```

8. If `ado_wiki_pull` returns an error (page not found): stop with "Wiki page not found: {wiki-path}."
