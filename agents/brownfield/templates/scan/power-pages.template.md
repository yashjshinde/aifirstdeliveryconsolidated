<!--
power-pages.template.md - SCAN TEMPLATE for the power-pages platform.
Consumed by /scan.
-->
---
platform: power-pages
scan-version: 1.0.0
consumed-by: brownfield-engine/extractor.ts
last-reviewed: 2026-05-15
---

# Scan Template — power-pages

## Pre-flight (`/prepare`)

- `_brownfield/input/power-pages/` exists
- At least one site XML export OR a Power Pages source folder with `website.yml`

## Extraction walk (`/scan`)

### Step 1 — Site discovery

For each site export folder:
- Read top-level `website.yml` / `adx_website.xml` → emit `power-pages-site` (container artifact)

### Step 2 — Walk Power Pages assets

```
adx_webpage/*.xml                       -> web-page
adx_webtemplate/*.xml                   -> web-template
adx_webrole/*.xml                       -> web-role
adx_entitypermission/*.xml              -> table-permission
adx_contentsnippet/*.xml                -> content-snippet
adx_websitebinding/*.xml                -> website-binding (cross-ref only; not artefact)
adx_websitelanguage/*.xml               -> website-language (multilingual surface)
adx_publishingstate/*.xml               -> publishing-state
adx_pagecomponent/*.xml                 -> page-component (parts inside pages)
adx_sitemarker/*.xml                    -> site-marker
adx_redirect/*.xml                      -> redirect rule
adx_sitesetting/*.xml                   -> site-setting
adx_weblink/*.xml                       -> web-link
adx_weblinkset/*.xml                    -> web-link-set
adx_webform/*.xml                       -> web-form (multi-step forms)
adx_entityform/*.xml                    -> entity-form
adx_entitylist/*.xml                    -> entity-list
adx_basicform/*.xml                     -> basic-form
adx_blog/*.xml                          -> blog (catalog-asset)
adx_forum/*.xml                         -> forum
```

### Step 3 — Identity providers + authentication settings

```
walk: identityProvider XML or site settings -> identity-provider
```

### Step 4 — Walk Liquid templates

For each `adx_webtemplate`:
- Capture the Liquid body verbatim
- Identify tag usage (`{% entitylist %}`, `{% entityform %}`, `{% include %}`, etc.) for cross-ref to entity-list / entity-form / page

### Step 5 — Cross-reference resolution

- `web-page` -> `web-template` (template binding via `adx_webtemplate.id`)
- `web-page` -> `web-role` (role gating via `adx_webrole.id`)
- `table-permission` -> `web-role` + Dataverse table (entity logical name)
- `entity-list` / `entity-form` / `basic-form` -> Dataverse table + view

### Step 6 — Validate inventory coverage

`validate_inventory_coverage` against `inventory.platforms.power-pages`.

## Output schema

Conforms to [`schemas/brownfield-inventory.v1.json`](../../../schemas/brownfield-inventory.v1.json).

## See also

- [`constitution/platforms/power-platform.md`](../../constitution/platforms/power-platform.md)
- [`templates/bindings/d365-ce/`](../bindings/d365-ce/) (Pages bindings cohabit the CE folder)
