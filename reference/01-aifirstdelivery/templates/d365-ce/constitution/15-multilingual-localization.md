# Constitution — Multilingual and Localization

The solution must be authored to support multiple languages even when only `en-US` is initially shipped. Discipline applied at build time (no hardcoded strings, RESX-based localization, ISO date payloads) makes adding a language a configuration event rather than a re-engineering effort. This is the **multi-language ready** posture.

References: [Enable languages](https://learn.microsoft.com/en-us/power-platform/admin/enable-languages), [Translate localizable text](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/translate-localizable-text), [Export / import translations](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/export-customized-entity-field-translations), [Power Platform language and locale collations](https://learn.microsoft.com/en-us/power-platform/admin/language-collations).

---

## 1 — Schema Is English; Display Is Localized

The schema layer must remain language-neutral. Localized strings live exclusively in display layer.

**Rules:**
- Schema names — tables, columns, relationships, alternate keys, choice **values** — are always **English-only, lowercase, prefixed**. See `03-dataverse-schema.md`.
- Choice / option set **values** (the integers behind the labels) are language-neutral and **immutable** across releases. Never re-use, re-purpose, or delete a value — add new values only.
- Display labels (table display names, column display names, view names, choice labels, app module labels, BPF labels, dashboard titles, email subject/body, site map labels) are localized via translation export.
- FetchXML, JS code, plugin code, and tests reference **schema names** only. Display names appearing in code are forbidden.

---

## 2 — Supported Languages Configuration

The set of languages the project supports is declared centrally and enforced as a configuration contract.

**Rules:**
- Declare `supported-languages` and `default-language` in `10-alm-configuration.md`. `default-language` is `en-US` unless explicitly documented.
- All non-Dev environments must have the same language pack set, enabled via [Power Platform admin → Languages](https://learn.microsoft.com/en-us/power-platform/admin/enable-languages).
- Adding a language to a project is a **deployment event**, not a runtime change: requires translation pass, UAT sign-off, CI export of new translation file.
- Removing a language from the supported list requires a release with explicit data-impact analysis (existing localized records, knowledge articles, email templates).

---

## 3 — Translation File Lifecycle (CI/CD)

Translations are source-controlled and round-tripped through CI — never edited in Test/UAT/Prod.

**Rules:**
- Translation export is part of the CI pipeline:
  1. **Export from Dev** via `pac solution export-translation` — output committed to `output/{feature}/translations/{solution}-translations-{date}.zip`.
  2. **Translator round-trip** — translation tool consumes the ZIP, returns it via PR. PR review confirms key coverage.
  3. **Import to Test/UAT/Prod** is automated via the release pipeline.
- The repo holds the **last approved translation set** as the source of truth. Direct edits in non-Dev environments are forbidden — they are overwritten on the next release.
- **Pseudo-localization** is run before any translator engagement: a non-prod environment enables a pseudo language (e.g., `qps-PLOC` or a manually-prefixed variant) to surface hardcoded strings, layout truncation, and concatenation bugs.
- Orphaned translation entries (string removed from solution but translation still in repo) are pruned each release. Quarterly governance review.

---

## 4 — Code-Side Localization (Plugins, JS, PCF, Power Automate)

Hardcoded English literals in user-facing code paths are forbidden. They surface as **BLOCKER** findings at `/review`.

### 4.1 Plugins

- User-facing exception messages are loaded from a localized resource — not literals.
- Localized resource lookup pattern (one of):
  - **RESX web resource** per culture: `{prefix}_strings.{culture}.resx` (e.g., `opex_strings.en-US.resx`, `opex_strings.fr-FR.resx`). Plugin reads the appropriate resource based on caller's `UserSettings.UILanguageId`.
  - **Per-language environment variable** for short-cardinality message catalogues.
- `InvalidPluginExecutionException` message must come from the localized resource. Example pattern (illustrative):
  ```csharp
  var lang = userSettings.UILanguageId;
  var msg = StringsResource.Get("ACCOUNT_NAME_REQUIRED", lang);
  throw new InvalidPluginExecutionException(msg);
  ```
- Trace messages (server log) may remain in English — they are operational, not user-facing.

### 4.2 JavaScript Web Resources

- All user-facing strings live in `{prefix}_strings.{culture}.js` web resources, loaded from form OnLoad based on `Xrm.Utility.getGlobalContext().userSettings.languageId`.
- The form script imports the language-appropriate strings file and references keys, never literals.
- Date and time formatting via `Xrm.Utility.formatDateTime` only — never `Date.toLocaleString()` with hardcoded format strings.
- Currency formatting uses Dataverse currency-aware APIs; never string-concatenate currency symbols.

### 4.3 PCF Controls

- Strings live in `strings/{culture}.resx` files referenced from `ControlManifest.Input.xml`:
  ```xml
  <resources>
    <resx path="strings/Control.1033.resx" version="1.0.0" />
    <resx path="strings/Control.1036.resx" version="1.0.0" />
  </resources>
  ```
- Access strings via `context.resources.getString("KEY")` — never embed literals in TypeScript.
- All cultures declared in the manifest must have a corresponding RESX file; CI fails the build if any are missing.
- See [PCF resx localization](https://learn.microsoft.com/en-us/power-apps/developer/component-framework/manifest-schema-reference/resx).

### 4.4 Power Automate Flows

- User-facing flow output (email subject/body, approval prompt, error notification) reads from a "Localization" reference table or a switch on the user's `UILanguage`.
- Flow naming and step naming may remain English — these are developer-facing.
- Email templates triggered by flows respect recipient language (see §6).

---

## 5 — User Language Resolution

Runtime language selection follows a deterministic fallback chain.

**Rules:**
- Primary: user's `UserSettings.UILanguageId` (Dataverse) or `Xrm.Utility.getGlobalContext().userSettings.languageId` (client).
- Fallback 1: org base language (`organization.languagecode`).
- Fallback 2: `en-US` as ultimate default.
- Code references the chain explicitly — never assume a single language is available.
- Date/time format follows user's `LocaleId` independently of language.
- Currency: transactional currency drives the value; user locale drives the formatting only. Currency conversion uses OOB exchange rate engine, not custom calculation.

---

## 6 — Email Templates and Customer Notifications

Email templates are language-specific and recipient-language-driven.

**Rules:**
- One email template per language per use case. Naming: `{prefix}_{purpose}_{culture}` (e.g., `opex_BookingConfirmation_fr-FR`).
- Recipient language drives template selection — `Contact.PreferredLanguageCode` for customer-facing, `SystemUser.UILanguageId` for internal.
- Subject and body both localized.
- Templates are separate solution components — never one template with conditional language logic embedded.
- A flow that sends customer-facing email looks up recipient language and selects the matching template; if no match, falls back to `default-language`.

---

## 7 — Multilingual Knowledge Articles

Field Service and Customer Service depend on Knowledge Articles. Use the OOB multilingual KB workflow — never custom.

**Rules:**
- The root article is in the `default-language`. Translations are child articles linked via `IsRootArticle` / Related Knowledge Articles.
- Knowledge Search returns the user-language article by default. Custom Knowledge Search bypassing this is forbidden.
- Knowledge Article Templates carry language tags so approvers/translators route correctly.
- Article version selection is per language: a major version of the root article triggers re-translation of all child articles before re-publication.

References: [Translate articles into multiple languages](https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/translate-articles-multiple-languages), [Multilingual content for Customer Service](https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/multilingual-content).

---

## 8 — Field Service-Specific Multilingual Rules

Field Service intersects with both internal users (technicians, dispatchers) and customer-facing surfaces. Language ownership differs per artefact.

| Artefact | Language driver | Rule |
|---|---|---|
| Service Task instructions | Tech UI language | Localize via Service Task Type templates per language. No free-text per work order in mixed languages. |
| Incident Type description / instructions | Tech UI language | Localize via translation file. |
| Resolution / technician notes | Tech UI language at entry time | Free-text data; do not auto-translate; flag the language on the row for downstream reporting. |
| Customer-facing booking confirmation email | Account `PreferredLanguageCode` | Use the matching template per §6. |
| Agreement-generated PDF (sent to customer) | Account `PreferredLanguageCode` | Word/SSRS templating per language; do not generate one PDF and post-translate. |
| Schedule Board labels | Dispatcher UI language | Display Work Order titles in Dispatcher UI language; if title is customer-language, localize via lookup. |
| Mobile app strings (FS Mobile) | Tech UI language | All strings via the per-culture web resource pattern (§4.2). |
| Mobile offline metadata | n/a | **Cost: ~10% offline DB growth per additional language pack enabled.** Counts against the 1 GB ceiling — see `11-nfr-targets.md` and `13-field-service-scheduling-and-mobile.md` §4. |

**Rules:**
- Confirm each technician's `UILanguageId` is in the org's `supported-languages` set before deploying to that user. Out-of-set users are blocked at the user-provisioning step.
- For multilingual mobile profiles, performance review is **mandatory** before deployment — measure offline DB size against the ceiling with all language packs loaded.

---

## 9 — Right-to-Left (RTL) Support

When the supported set includes any RTL language (Arabic, Hebrew, Persian, Urdu), all UI extensions must be RTL-safe.

**Rules:**
- PCF and HTML web resources use **logical CSS properties** (`margin-inline-start`, `margin-inline-end`, `padding-inline-start`, `padding-inline-end`, `text-align: start | end`). Never `margin-left`, `margin-right`, `text-align: left`, or pixel-positional logic that assumes LTR.
- Test all customised forms with RTL UI direction. Capture a screenshot per supported language; attach to the FDD §6 (Localization Matrix).
- Schedule Board PCF cells must mirror correctly under RTL.
- Date/number/currency formatting handled by the platform — do not hand-roll.

---

## 10 — Number, Date, Currency, Time Zone

**Rules:**
- All date/time on the wire (integration payloads, audit logs, plugin SharedVariables) is **ISO-8601 UTC**. Localization is presentation-layer only.
- All UI date/time formatting goes through `Xrm.Utility.formatDateTime` (client) or culture-aware .NET formatting using user's `LocaleId` (server). Hardcoded format strings are forbidden.
- Currency: never concatenate `"$" + amount`; always use locale-aware currency formatter. Currency type fields (not Decimal) are used per `03-dataverse-schema.md`.
- Time zone: user's `TimeZoneCode` controls UI; storage is always UTC. Plugins that compare or filter dates must convert to UTC before comparison.

---

## 11 — Translation Coverage Governance

Every release gate verifies translation completeness.

**Rules:**
- **Release gate:** every new component (form label, view name, choice value, message string, email template, KB article) must have translations for every language in `supported-languages` before UAT promotion. Missing translations block the release.
- **Quarterly review:** orphaned translation entries pruned; coverage report (% of strings translated per language) tracked.
- **/review checks:** the spec review checklist enforces multilingual rules — see `Prompts/review/checklist.md`.

---

## 12 — Document Generation and Translation Matrix

The FDD identifies localization scope explicitly.

**Rules:**
- FDD §6 (D365 CE Impact Summary) gains a **Localization Matrix** sub-section listing every UI string, choice value, email template, and KB article requiring translation. Columns: artefact, current language, target languages, translator, target sign-off date.
- TDD §8 documents the translation lifecycle for the feature (export schedule, translator team, import gates).
- FDD/TDD/Blueprint documents themselves are authored in English (the project lingua franca). Translated copies for stakeholders are out of scope of `/document` unless explicitly requested.

---

## 13 — Testing

Multi-language testing is mandatory; covered in `08-testing-standards.md`.

**Rules (summary):**
- Smoke tests run per language for primary forms, email templates, and exception messages.
- Pseudo-localization environment runs before each release.
- Date/currency edge cases tested per supported locale (e.g., comma-decimal `1.234,56` vs period-decimal `1,234.56`).
- Test scripts reference schema names — never display names.
- For RTL languages, capture a screenshot per primary form per release.

---

## 14 — Cross-Reference

- `02-plugin-standards.md` §Localization — plugin exception messages from RESX.
- `03-dataverse-schema.md` §Schema Naming — schema is English-only.
- `04-javascript-standards.md` §Localization — JS strings from per-culture web resources.
- `05-pcf-standards.md` §Localization — PCF RESX per culture.
- `07-devops-alm.md` §Translation CI — export/import lifecycle.
- `08-testing-standards.md` §Multilingual Testing — smoke + RTL + pseudo-loc.
- `09-document-generation-rules.md` §Localization Matrix — FDD requirement.
- `10-alm-configuration.md` §Supported Languages — configuration keys.
- `11-nfr-targets.md` §Field Service Mobile — multilingual offline cost.
- `Prompts/review/checklist.md` — multilingual checks.
- `13-field-service-scheduling-and-mobile.md` §Mobile — offline metadata growth per language pack.
