# ALM Agent — GitHub Copilot Template

Azure DevOps integration agent for AI First Delivery projects.
Creates, syncs, and manages work items, wiki pages, test assets, sprints, and pipelines in Azure DevOps,
reading inputs from domain agent outputs and writing ALM IDs back into all project documents.

---

## What's Included

```
ghcptemplates/alm/
├── .github/
│   ├── agents/
│   │   └── alm.agent.md              ← Copilot agent definition
│   ├── instructions/
│   │   └── alm-constitution.instructions.md  ← Auto-injected safety rules
│   └── prompts/
│       ├── alm-wi-get.prompt.md
│       ├── alm-wi-get-children.prompt.md
│       ├── alm-wi-create.prompt.md
│       ├── alm-wi-create-bulk.prompt.md
│       ├── alm-wi-sync.prompt.md
│       ├── alm-wi-status.prompt.md
│       ├── alm-wi-export.prompt.md
│       ├── alm-wiki-push.prompt.md
│       ├── alm-wiki-pull.prompt.md
│       ├── alm-wiki-sync.prompt.md
│       ├── alm-test-create.prompt.md
│       ├── alm-test-create-plan.prompt.md
│       ├── alm-test-create-suite.prompt.md
│       ├── alm-test-create-case.prompt.md
│       ├── alm-test-sync.prompt.md
│       ├── alm-test-get.prompt.md
│       ├── alm-sprint-assign.prompt.md
│       ├── alm-pipeline-run.prompt.md
│       ├── alm-pipeline-status.prompt.md
│       ├── alm-cleanup-wi.prompt.md
│       ├── alm-cleanup-wi-tree.prompt.md
│       ├── alm-cleanup-test.prompt.md
│       └── alm-cleanup-suite.prompt.md
├── constitution/
│   ├── CLAUDE.md                     ← Agent rules and MCP tools reference
│   ├── 00-index.md                   ← Constitution index
│   └── 10-alm-configuration.md       ← Configure before first use
└── output/                           ← ALM response JSON files
```

---

## How to Deploy

1. **Copy this folder** to your project root (or copy just the `.github/` folder if your project already has one).

2. **Configure the MCP server** — this template requires the `ado-alm` MCP server from `tools/mcp-server/`. Build it once:
   ```powershell
   cd tools/mcp-server
   npm install
   npm run build
   ```

3. **Add MCP settings** — create `.github/settings.json` (gitignored) with your ADO credentials:
   ```json
   {
     "mcpServers": {
       "ado-alm": {
         "command": "node",
         "args": ["ABSOLUTE_PATH/tools/mcp-server/dist/index.js"],
         "env": {
           "ADO_ORG_URL": "https://dev.azure.com/your-org",
           "ADO_PROJECT": "YourProject",
           "ADO_PAT": "your-pat-here"
         }
       }
     }
   }
   ```

4. **Configure project settings** — edit `constitution/10-alm-configuration.md`:
   - Set `wiki-id` and `wiki-root`
   - Verify domain paths match your project structure

5. **Open in VS Code** — the ALM Agent will appear in GitHub Copilot Chat.

---

## How to Use in Copilot Chat

Open GitHub Copilot Chat and select the **ALM Agent** from the agent dropdown, or type `@ALM Agent` followed by a prompt command.

### Work Items
| Prompt | What it does |
|---|---|
| `/alm-wi-create-bulk d365-ce my-feature` | Bulk create ADO work items from domain extract |
| `/alm-wi-create-bulk d365-ce my-feature --dry-run` | Preview items without creating |
| `/alm-wi-sync d365-ce my-feature` | Write ALM IDs back into all local documents |
| `/alm-wi-status d365-ce my-feature` | Show sync status |
| `/alm-wi-get 12345` | Get a single work item |
| `/alm-wi-get-children 12345` | Get full hierarchy under an Epic |

### Wiki
| Prompt | What it does |
|---|---|
| `/alm-wiki-sync d365-ce my-feature` | Push all sync-enabled docs to ADO wiki in one pass — supports all 8 domains (d365-ce, integration, power-apps, reporting, data-migration, d365-fo, solution-architect, solution-estimate) |
| `/alm-wiki-push d365-ce my-feature spec` | Push a single document to wiki (any doc key: spec, fdd, tdd, blueprint, testplan, review, clarify, deployment-guide, etc.) |
| `/alm-wiki-pull /Delivery/my-feature/spec` | Pull a wiki page locally |

> Sync toggles and domain paths are configured per-project in `constitution/10-alm-configuration.md`. See `alm-wiki-sync.prompt.md` for the full toggle reference and domain applicability matrix.

### Test Plans
| Prompt | What it does |
|---|---|
| `/alm-test-create d365-ce my-feature` | Create Test Plan + Suites + Cases in ADO |
| `/alm-test-create d365-ce my-feature --dry-run` | Preview test plan without creating |
| `/alm-test-sync d365-ce my-feature` | Write test ALM IDs back into test plan docs |

### Sprint & Pipeline
| Prompt | What it does |
|---|---|
| `/alm-sprint-assign d365-ce my-feature Sprint-3` | Assign all work items to a sprint |
| `/alm-pipeline-run 42` | Trigger a pipeline run |
| `/alm-pipeline-status 42 1001` | Check pipeline run status |

### Cleanup ⚠ Destructive
| Prompt | What it does |
|---|---|
| `/alm-cleanup-wi-tree 12345` | Delete Epic and all descendants (confirmation required) |
| `/alm-cleanup-test 67` | Delete Test Plan + all Suites + Cases (confirmation required) |

---

## Typical Flow

```
1. In domain template:    /alm extract {feature}
                          → output/{feature}/alm/extract-*.json

2. In ALM agent:          /alm-wi-create-bulk {domain} {feature}
                          → ADO: Epic → Feature → Story → Task (linked)

3. In ALM agent:          /alm-wi-sync {domain} {feature}
                          → work-items.yaml, plan.md, task cards, spec.md updated

4. In domain template:    /extract testplan {feature}
                          → output/{feature}/alm/test-plan-extract.json

5. In ALM agent:          /alm-test-create {domain} {feature}
                          → ADO: Test Plan + Suites + Cases

6. In ALM agent:          /alm-test-sync {domain} {feature}
                          → test plan documents updated with ALM IDs

7. In ALM agent:          /alm-wiki-sync {domain} {feature}
                          → all enabled documents pushed to ADO wiki
```

---

## Key Difference from Claude Code Version

| Aspect | Claude Code (`tools/alm-agent`) | GitHub Copilot (`ghcptemplates/alm`) |
|---|---|---|
| Command prefix | `/wi-create-bulk` | `/alm-wi-create-bulk` |
| Config location | `.claude/settings.json` | `.github/settings.json` |
| Agent definition | Auto-loaded via CLAUDE.md | `.github/agents/alm.agent.md` |
| Auto-injected rules | Via `.claude/` conventions | `.github/instructions/alm-constitution.instructions.md` |
| MCP server config | `.claude/settings.json → mcpServers` | `.github/settings.json → mcpServers` |
