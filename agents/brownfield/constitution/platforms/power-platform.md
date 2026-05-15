---
agent: brownfield
sub-area: platforms/power-platform
version: 1.0.0
last-reviewed: 2026-05-15
owner: domain
---

# Platform Rules — power-platform (brownfield)

> Covers Canvas apps, Power Pages, PCF controls, Custom Pages, and Power Automate Desktop. Power Automate cloud flows when CE-bound roll up into the d365-ce platform; standalone cloud flows here.

## Accepted input file types

Under `_brownfield/input/power-apps/`, `_brownfield/input/power-pages/`, `_brownfield/input/custom-pages/`:

| Input | Format | Notes |
|---|---|---|
| Canvas app | `.msapp` | ZIP archive; unpack to YAML + JSON via Power Platform CLI (`pac canvas unpack`) |
| Canvas source folder | Power Apps source format (`Src/`, `OnStartFormula.txt`, screens) | Preferred — direct text source |
| Canvas component library | `.msapp` | Same unpack treatment |
| Power Pages site | site XML export | Page hierarchy + templates + web roles + table permissions |
| PCF source | `index.ts` + `ControlManifest.Input.xml` + `package.json` | Preferred |
| PCF compiled | `.zip` deployment package | Inventory-level only + `BLOCKED-BY-BINARY` for full TS logic |
| Custom Pages | XAML / JSON exports from Maker Portal | Treated as ui-asset |
| Power Automate Desktop | `.txt` / proprietary script | Inventory-level + flag for cleanup; full automation script analysis is best-effort |

## Scan strategy

### Canvas apps

1. Unpack `.msapp`: `pac canvas unpack --msapp <file> --sources <folder>`
2. Walk source folder:
   - `Src/*.fx.yaml` per screen → screen + controls + Power Fx formulas
   - `Connections/*.json` → data source connections + connector references
   - `DataSources/*.json` → tabular data source definitions (e.g., Dataverse table references)
   - `Themes.json` → app theme
   - `Properties.json` → app properties (OnStart formula, navigation defaults)
   - `Assets/` → embedded images / fonts / media

### Canvas component libraries

- Same unpack treatment as apps
- Each component is a section in the library doc; library is a `container-asset` and each component is a `ui-asset` with a `parent: <library>` cross-ref

### Power Pages

1. Walk site XML export:
   - `adx_webpage/*.xml` → web pages
   - `adx_webtemplate/*.xml` → web templates (Liquid)
   - `adx_webrole/*.xml` → web roles
   - `adx_entitypermission/*.xml` → table permissions
   - `adx_contentsnippet/*.xml` → content snippets
   - `adx_websitebinding/*.xml` → site bindings
   - `adx_websitelanguage/*.xml` → multilingual language bindings
   - `adx_publishingstate/*.xml` → publishing workflow
2. Cross-link pages → templates (page references template by id)
3. Cross-link table-permissions → web-roles (permission carries role id)

### PCF controls

1. From source: parse `ControlManifest.Input.xml` for control namespace + properties + resources
2. From `index.ts`: identify lifecycle method overrides (`init`, `updateView`, `getOutputs`, `destroy`)
3. From compiled `.zip` without source: inventory-level only + `BLOCKED-BY-BINARY` for lifecycle logic

### Custom Pages

1. From XAML / JSON: extract page structure (controls + layout)
2. Cross-link to model-driven app that hosts the page (when sitemap reference present)

### Power Automate Desktop

1. From `.txt` script: enumerate top-level actions (BeginGroup / IfStatement / etc.)
2. Inventory-level documentation when full action list parsing not reliable
3. Identify external automation surfaces (Excel / web browser / desktop application)

## Module detection signals (power-platform side)

No module gating at platform level — Power Apps / Pages / PCF / Custom Pages always run when their input folder is present.

## Analysis rules

### Canvas apps

- One doc per app (NOT per screen — screens are sections within the app doc)
- Screens: name + OnVisible formula + control tree (top-level controls listed)
- Power Fx formulas: per-control top-level formulas verbatim (extract from `.fx.yaml`)
- Data source list: connector type + connection reference + table/list (when applicable)
- Components used: library + component name

### Power Pages

- One doc per **page** (NOT per site — site is a `container-asset` at the top of the platform tree)
- Per page: parent page + template binding + page-level web role gating + URL
- Per template: Liquid body verbatim (escaped for Markdown)
- Per web role: anonymous-or-authenticated + table-permission summary
- Per table permission: role + table + scope (Global / Contact / Account / Self) + privileges (R/W/C/D/A/AS)

### PCF controls

- One doc per control (namespace + name)
- Manifest: properties (type-of, usage, of-type), data-set vs field, resources
- Lifecycle: per-method narrative when source available
- Theming + DI usage flagged

### Custom Pages

- One doc per page
- Layout structure + control list
- Hosted-in model-driven app (cross-ref)

## Cross-references for power-platform

- canvas-app ↔ component-library (used components)
- canvas-app ↔ connector (data source binding)
- web-page ↔ web-template (template binding)
- web-page ↔ web-role (page-level role gating)
- table-permission ↔ web-role + Dataverse table
- pcf-control ↔ Dataverse field (binding when field-type PCF)
- custom-page ↔ model-driven-app (host)

## See also

- [04-input-file-types-base.md](../04-input-file-types-base.md)
- [`templates/bindings/d365-ce/`](../../templates/bindings/d365-ce/) (Canvas / Pages / PCF bindings cohabit the CE folder for now per the inventory in [agents/brownfield.md § ~185 bindings](../../../design/agents/brownfield.md))
- [`templates/scan/power-apps.template.md`](../../templates/scan/power-apps.template.md)
- [`templates/scan/power-pages.template.md`](../../templates/scan/power-pages.template.md)
- [`templates/scan/custom-pages.template.md`](../../templates/scan/custom-pages.template.md)
