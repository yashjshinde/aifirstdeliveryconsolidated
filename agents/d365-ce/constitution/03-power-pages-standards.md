---
agent: d365-ce
sub-platform: power-pages
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# Power Pages Standards

> Conventions for Power Pages portal: web pages, web templates, web roles, table permissions, web files, content snippets, identity providers.

## Site

- **One Power Pages site per portal-facing audience** (typically one per project). Site name `{publisherPrefix}-portal-{slug}`.
- **Identity providers** declared explicitly: local accounts + Azure AD B2C + (optional) external IdPs. Each documented in FDD §4 sub-platform pack + §6 Security.
- **Anonymous access** is allowed by default for marketing-content pages; explicitly turned off for everything else.

## Web roles

- **Authenticated User** (default for any logged-in visitor)
- **Anonymous User** (default for not-logged-in)
- **Custom roles** per requirement (e.g., "Customer", "Partner", "Internal Reviewer")
- Each web role's permissions matrix documented in FDD §6 with the table-permissions it grants and what's denied.

## Table permissions

- **Scope** must always be explicit: Contact / Account / Self / Parent / Global.
- **Privilege selection** is least-privilege by default. Read + (optional) Write; Create + Delete only when the requirement clearly demands.
- Document every table permission in FDD §6 with the web roles it's attached to + scope + privileges.

## Web pages, web templates, page templates

- **One web template per layout shape** (e.g., 2-column, 3-column, full-bleed). Liquid templates live in the portal solution.
- **Page template** binds a content type to a web template; documented in FDD §4 sub-platform pack.
- **Page hierarchy** kept shallow (max 3 levels). Document the IA in FDD §4.

## Liquid

- **No inline credentials** or environment-specific URLs in Liquid; use site settings or environment variables.
- **`fetchxml` queries** in Liquid use entity permission auto-filtering — never bypass with `unsafe_inherit_permissions`.
- **Output escaping** by default; only use raw HTML output (`| escape: false`) for sanitised CMS content.

## Web files (assets)

- Filename pattern `{slug}.{ext}`. Stored as web files in the portal solution.
- Image alt text mandatory for accessibility.
- CSS / JS bundled via the standard portal build step; no inline `<script>` blocks beyond initial bootstrap.

## Content snippets

- Used for CMS-editable content (CTA banners, marketing copy). Each content snippet typed; documented in FDD §4.
- Multilingual content snippets per `project.config.yaml multilingual.portal: true`.

## Authentication

- **Azure AD B2C** is the default for customer-facing portals. Document tenant + user flows in FDD §6.
- **Forced HTTPS** site-wide. HSTS enabled.
- **Session timeout** configured per security baseline.

## Performance

- **Page caching** via standard portal caching profiles. Documented per-page in FDD §4.
- **Anonymous-cacheable pages** marked explicitly; authenticated pages bypass cache.

## Multilingual

- When `project.config.yaml multilingual.portal: true`, every page has localised variants. Default language from `multilingual.defaultLanguage`. Translation table maintained per content type.
- RTL support enabled when any supported language is RTL.

## Testing

- Per `project.config.yaml unitTestPolicy.portal: required` (default). Coverage: Liquid template rendering, table-permission enforcement (positive + negative), authentication flows.

## FDD section ownership

Power Pages sub-platform pack owns:
- §4 (Pages-specific): site map + page hierarchy + web roles + table permissions matrix + identity providers
- §6 (Pages-specific security): web role privilege matrix + table permission scopes
- §9 (Multilingual when enabled): localised content snippets + translation table coverage
