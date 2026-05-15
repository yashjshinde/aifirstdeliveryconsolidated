---
agent: reporting
sub-area: multilingual
version: 1.0.0
last-reviewed: 2026-05-15
owner: domain
---

# Multilingual + Accessibility Standards

## When multilingual applies

Activated when `project.config.yaml multilingual.reports: true`. Default off.

## Locales

- Locales drawn from `project.config.yaml locales` (e.g., `[en-US, fr-CA, ar-AE]`).
- Default fallback: en-US.
- RTL (Arabic / Hebrew) handled at the visual level — switch axis ordering, label alignment, page mirroring.

## Power BI translations

- Dataset field display names + folder names translated via the Tabular Editor "Translations" feature.
- Per-locale `.json` files committed to `output/reports/power-bi/translations/{locale}.json`.
- Translations cover: tables, columns, measures, hierarchies, levels, perspectives.

## SSRS report localisation

- Parameter prompts + group/column headers + static text rendered from a `Strings` dataset keyed on `LCID + StringKey`.
- `Strings` table sourced from a per-project SQL view or Dataverse entity (declared in TDD).
- Date / number / currency formatting via `Format(value, format, languageCode)`.

## Accessibility

- WCAG AA contrast minimum on themes (background vs foreground; data colours vs background).
- Alt-text on every visual carrying business meaning (NOT decorative).
- Screen-reader-friendly navigation: page titles unique, tab order set per page.
- Colour-blind-safe palettes for default theme (Tableau 20 or similar approved palette).

## Number / date / currency

- Currency rendered with locale formatting at the visual level (never hard-coded `$`).
- Dates rendered in locale order (ISO-8601 yyyy-MM-dd preferred when locale-neutral).
- Decimal / thousand separators per locale.

## See also

- [02-power-bi-standards.md](02-power-bi-standards.md)
- [01-ce-ssrs-standards.md](01-ce-ssrs-standards.md)
- [d365-ce constitution/08-multilingual.md](../../d365-ce/constitution/08-multilingual.md) (when CE entity display names need to align)
