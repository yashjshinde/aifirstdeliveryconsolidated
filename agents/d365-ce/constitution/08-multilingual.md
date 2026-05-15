---
agent: d365-ce
sub-platform: multilingual
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# Multilingual Considerations for d365-ce

> Per-channel multilingual scope, driven by `project.config.yaml multilingual.*`.

## Per-channel scope

| Channel | Config key | Scope when true |
|---|---|---|
| **CRM / model-driven** | `multilingual.crm` | Entity display names, form labels, field labels, view names, option-set labels, error messages localised for every `multilingual.supportedLanguages` |
| **Portal / Power Pages** | `multilingual.portal` | Page slugs (per language), content snippets translated, Liquid template `{% block %}` content per language, navigation localised |
| **Canvas apps** | `multilingual.canvas` | App labels via `Translate` function backed by a labels collection; default language from `multilingual.defaultLanguage` |
| **Reports** *(reporting agent, not this one)* | `multilingual.reports` | (Reporting agent owns this) |

When the config key is `false`, treat the channel as English-only and do not author translations.

## Default + supported languages

Read from `project.config.yaml multilingual.defaultLanguage` (e.g., `en-US`) and `multilingual.supportedLanguages` (e.g., `[en-US, fr-FR, ja-JP]`).

- Default language is authored first; other languages are translations.
- Adding a language is a separate spec/plan item; not a single feature's responsibility.

## CRM-side multilingual (when `multilingual.crm: true`)

- **Entity / column display names**: enabled languages installed in the Dataverse environment; display names provided per language.
- **Form labels**: use Translation Export / Import (XLSX) to manage. Document the workflow in FDD §9.
- **Option set labels**: same — per language.
- **Plugin error messages**: hard-coded English fall-back; localised messages via a `Translations` entity (entity owned by this agent; declared in `01-model-driven-standards.md` reference data per project).

## Portal-side multilingual (when `multilingual.portal: true`)

- Per-language **content snippets** for CMS content (banners, CTAs, FAQ).
- Per-language **web pages** when content differs substantially (not just a label translation).
- **Language switcher** in the portal header; remembers user preference.
- **RTL support** when any supported language is RTL (Arabic, Hebrew). Document RTL impact on layout in FDD §4.

## Canvas-side multilingual (when `multilingual.canvas: true`)

- Labels collection at app `OnStart`: `ClearCollect(colLabels, Translations_OData_or_static_table)`.
- `Translate("KeyName")` Power Fx user-defined function looks up the current `Language()` and returns the value.
- Fallback to default language when a translation is missing.
- Document the labels-collection size + refresh strategy in FDD §4 sub-platform pack.

## Date / time / number formatting

- **Use `Language()` everywhere** (Power Fx) or current user's `LcId` (JS) — never hard-code a locale.
- Currency formatting via Dataverse's per-user currency setting + the entity's currency-field.
- Time zones: store UTC, render in user's timezone (Dataverse handles this by default).

## Testing

- When any `multilingual.*` is true: the test plan MUST include a Multilingual suite (per `07-testing.md`).
- Coverage: every user-visible string in every supported language; RTL layout (when applicable); currency / date formatting per language.

## FDD section ownership

Multilingual sub-platform pack contributes to:
- §9 Multilingual Considerations (per R19 A12) — overview of which channels are multilingual + supported languages + the translation-table workflow
