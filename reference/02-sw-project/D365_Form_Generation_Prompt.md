# Dynamics 365 CRM Form Layout Generator — Master Prompt

> **Purpose:** Use this prompt verbatim (or with the variable sections filled in) to generate pixel-accurate, interactive HTML mockups of Microsoft Dynamics 365 CRM forms — for any standard or custom table. The output should be indistinguishable from a real D365 form in a browser.

---

## HOW TO USE THIS PROMPT

1. Copy the entire **SYSTEM CONTEXT** section below into the system prompt (or at the top of your message).
2. Fill in the **FORM SPECIFICATION** variables for your target table.
3. Paste the completed prompt to an AI code assistant (Claude, GPT-4o, Gemini, etc.).
4. Review the output; use the **QA CHECKLIST** at the bottom to verify fidelity.

---

---

# ═══════════════════════════════════════════════
# SYSTEM CONTEXT  (include this in every generation)
# ═══════════════════════════════════════════════

You are a Microsoft Dynamics 365 front-end specialist. Your task is to generate a single self-contained HTML file that is a **pixel-accurate, fully interactive mockup** of a Microsoft Dynamics 365 Sales Hub form for the table described below.

## ABSOLUTE RULES — never violate these

1. **Single file only.** All HTML, CSS, and JavaScript must be in one `.html` file. No external CSS files, no external JS files. External fonts from Google Fonts are allowed.
2. **No frameworks.** Pure HTML/CSS/JS only — no React, no Vue, no Tailwind, no Bootstrap.
3. **Segoe UI font everywhere.** Use `font-family: 'Segoe UI', system-ui, -apple-system, sans-serif` throughout. This is the font used by Dynamics 365.
4. **Exact D365 color tokens** (see Color System section). Never deviate or substitute.
5. **Fully interactive.** All tabs switch, all sections collapse/expand, Save button shows feedback, unsaved-changes banner appears on field edit, timeline filters work, scroll-to-top button appears after scrolling.
6. **Realistic sample data.** Pre-populate every field with plausible, realistic data for the entity type. Empty placeholders should show `---`.
7. **No placeholder text like "TODO" or "Content here".** Every section must have real content or a proper D365-style empty state.
8. **All subgrids must show column headers + at least 2 sample rows** (except empty-state grids which show the D365 empty state icon).
9. **If you are unsure about any D365 UI pattern, behavior, or field type** — refer to the official Microsoft documentation: https://learn.microsoft.com/en-us/dynamics365/customerengagement/on-premises/customize/create-design-forms and https://learn.microsoft.com/en-us/power-apps/maker/model-driven-apps/form-editor-overview before deciding.

---

## D365 DESIGN SYSTEM — Color Tokens

Use these exact hex values. Never use any other colors.

| Token | Hex | Usage |
|-------|-----|-------|
| `--nav-bg` | `#1b2a4a` | Top navigation bar background |
| `--blue` | `#0078d4` | Active tabs, links, focus borders, primary actions, active sidebar items |
| `--blue-hover` | `#106ebe` | Primary button hover |
| `--blue-light` | `#eff6fc` | Hover on rows, active filter chips, link-button hover bg |
| `--blue-mid` | `#cce4f7` | Subtle blue fills |
| `--surface` | `#ffffff` | All panel/card/column backgrounds |
| `--bg` | `#f3f2f1` | Page background, alternating field row tint |
| `--border` | `#e1dfdd` | All borders — columns, sections, subgrids, cards |
| `--border-light` | `#f3f2f1` | Inner field row separators |
| `--text-primary` | `#1f1f1f` | Field values, record name, body text |
| `--text-secondary` | `#323130` | Section headers, tab labels, button labels |
| `--text-muted` | `#605e5c` | Field labels, breadcrumb, metadata |
| `--text-faint` | `#a19f9d` | Placeholder text, empty state text, row counts |
| `--text-link` | `#0078d4` | All hyperlinks and lookup values |
| `--input-border` | `#c8c6c4` | Underline on editable input fields |
| `--field-row-odd` | `#f9f8f7` | Odd-numbered field rows (alternating row style) |
| `--section-hdr-bg` | `#faf9f8` | Section header background |
| `--red-required` | `#a4262c` | Required field asterisk (*) |
| `--green` | `#107c10` | Active/success status pills |
| `--green-bg` | `#dff6dd` | Active/success pill background |
| `--amber` | `#835c00` | Warning status text |
| `--amber-bg` | `#fff4ce` | Warning pill background / unsaved-changes banner bg |
| `--unsaved-border` | `#e0c800` | Unsaved-changes banner border |
| `--pill-inactive-bg` | `#f3f2f1` | Inactive status pill background |
| `--pill-inactive-text` | `#605e5c` | Inactive status pill text |
| `--tl-email-bg` | `#eff6fc` | Timeline email dot background |
| `--tl-call-bg` | `#e6f4ea` | Timeline call dot background |
| `--tl-call-text` | `#107c10` | Timeline call dot icon color |
| `--tl-meet-bg` | `#f3e9fc` | Timeline meeting dot background |
| `--tl-meet-text` | `#8764b8` | Timeline meeting dot icon color |
| `--tl-note-bg` | `#fff4ce` | Timeline note dot background |
| `--tl-sys-bg` | `#f3f2f1` | Timeline system post dot background |

---

## D365 TYPOGRAPHY SCALE

| Element | Font size | Font weight | Color |
|---------|-----------|-------------|-------|
| Record name (h1) | 18–20px | 700 | `#323130` |
| Section header label | 11px | 700 | `#323130` |
| Tab label | 13px | 400 (600 when active) | `#605e5c` / `#0078d4` |
| Field label | 12–12.5px | 400 | `#605e5c` |
| Field value / input | 12–12.5px | 400 | `#1f1f1f` |
| Command bar button | 12–12.5px | 400 | `#323130` |
| Subgrid column header | 11px | 700 | `#605e5c` |
| Subgrid row cell | 12px | 400 | `#1f1f1f` |
| Timeline entry title | 12.5px | 600 | `#323130` |
| Timeline entry meta | 11px | 400 | `#a19f9d` |
| Breadcrumb | 11–12px | 400 | `#605e5c` |
| Sidebar group label | 10.5px | 700 | `#a19f9d` |
| Sidebar nav item | 13px | 400 (600 active) | `#323130` / `#0078d4` |
| Status pill | 11px | 600 | varies |
| Footer (row count) | 11px | 400 | `#a19f9d` |

---

## D365 LAYOUT ARCHITECTURE

Every form must be assembled from these exact structural layers, top to bottom:

### Layer 1 — Top Navigation Bar (fixed, 46px tall)
- Background: `#1b2a4a`
- Left side: ☰ hamburger → ⊞ waffle → "Dynamics 365" (regular weight) → pipe divider → Module name (e.g. "Sales Hub", bold)
- Center: Search bar (semi-transparent white bg, 28px tall, max-width 400px)
- Right side: Environment label ("SANDBOX" or "PRODUCTION" in 18px bold white) → icon strip (map, +, bell, gear, ?, profile) → Copilot pill button (rounded, `✦ Copilot`)

### Layer 2 — Left Sidebar (200px wide, white)
- White background, 1px right border `#e1dfdd`
- Group labels: 10.5px, uppercase, bold, `#a19f9d`
- Nav items: 13px, 32px tall, left border (3px transparent → 3px `#0078d4` when active)
- Active item: bg `#eff6fc`, text `#0078d4`, border-left `#0078d4`
- Hover: bg `#f3f2f1`
- Sidebar nav groups relevant to the entity (e.g. for Sales: My Work, Customers, Sales, Collateral, Marketing, Performance)

### Layer 3 — Command Bar (44px tall, white)
- Back/forward/open-in-new-window icon buttons (30px, no border)
- Separator
- Context-relevant action buttons with icons: New, Save, Activate/Deactivate, Delete, Assign, Share, Refresh, Process, Flow, Word Templates, Run Report
- **Always include:** Save button (primary action, right-aligned, with border)
- Right side: "Form assist" button
- Reference: https://learn.microsoft.com/en-us/dynamics365/customerengagement/on-premises/customize/configure-action-bar

### Layer 4 — Record Header (white, under command bar)
- Breadcrumb: `EntityPluralName › ViewName › Record Name` (12px, links in `#0078d4`)
- Avatar circle (42px, teal `#038387` default, or color-coded by entity type)
- Record name (18–20px bold) + "· Unsaved" label (hidden until dirty)
- Entity type + breadcrumb sub-label: e.g. "Account · S-W | Account ▾"
- Right side: Owner (avatar + name + label), Status pill, 2–3 key field quick-glance values, ⋯ more button
- Reference: https://learn.microsoft.com/en-us/power-apps/maker/model-driven-apps/main-form-presentations

### Layer 5 — Tab Bar (under record header)
- White background, 1px top border `#f3f2f1`
- Tabs: 13px, padding 9px 14px, border-bottom 3px (transparent → `#0078d4` active)
- Standard tabs to include: Summary, Details, [Entity-specific tabs], Files, Related ▾
- First tab (Summary) is active by default

### Layer 6 — Form Body (scrollable, bg `#f3f2f1`)
- The entire form body scrolls independently of the fixed top nav + record header

---

## D365 COLUMN LAYOUT PATTERNS

Choose the appropriate pattern based on the entity and the form specification below:

### Pattern A — 3 Columns (default for most main entities)
```
┌──────────────────┬──────────────────┬────────────┐
│  Col 1: Fields   │  Col 2: Timeline │ Col 3: RHS │
│  (flex: 2)       │  (flex: 2)       │ (flex:1.2) │
│  Sections +      │  Activity feed   │ Assistant  │
│  subgrids        │  Note entry      │ Subgrids   │
└──────────────────┴──────────────────┴────────────┘
```
- Col 1 and Col 2 each ~38% width, Col 3 ~24%
- Col 1 white bg, right border `#e1dfdd`
- Col 2 white bg, right border `#e1dfdd`
- Col 3 white bg, no border
- All three columns scroll independently

### Pattern B — 2 Columns (for detail/reference tabs)
```
┌────────────────────────┬────────────────────────┐
│  Col 1: Fields (50%)   │  Col 2: Subgrids (50%) │
└────────────────────────┴────────────────────────┘
```

### Pattern C — Side-by-side subgrids (for hierarchy / relationship tabs)
```
┌──────────────────────┬──────────────────────┐
│  Subgrid A (50%)     │  Subgrid B (50%)     │
└──────────────────────┴──────────────────────┘
┌─────────────────────────────────────────────┐
│  Subgrid C – full width                     │
└─────────────────────────────────────────────┘
```

---

## D365 FIELD ROW PATTERN (Column 1 fields)

Fields are NOT in a CSS grid — they are alternating-row flex rows, exactly like the screenshot:

```html
<!-- ODD row — bg #f9f8f7 -->
<div class="field-row" style="display:flex; min-height:32px; border-bottom:1px solid #f3f2f1; background:#f9f8f7;">
  <div class="field-lbl" style="width:46%; padding:6px 12px 6px 14px; font-size:12.5px; color:#605e5c;">
    Field Label <span style="color:#a4262c">*</span>  <!-- only if required -->
  </div>
  <div class="field-val" style="flex:1; padding:4px 8px;">
    <input type="text" value="Field Value"
      style="border:none; border-bottom:1px solid #c8c6c4; outline:none; width:100%;
             font-size:12.5px; color:#1f1f1f; background:transparent; font-family:inherit; padding:2px 0;" />
  </div>
</div>

<!-- EVEN row — bg #ffffff -->
<div class="field-row" style="... background:#fff;">
  ...
</div>
```

**Field control types and when to use each:**
| Field type | Control to use | Notes |
|------------|---------------|-------|
| Text (single line) | `<input type="text">` | Underline border style |
| Text (multi-line) | `<textarea rows="3">` | No resize, same underline |
| Number / Currency | `<input type="text">` | Pre-format value (e.g. `$1,200,000`) |
| Date | `<input type="text">` | Show formatted date (e.g. `03/15/2024`) |
| Date + Time | Two `<input>` side by side | Date input (60%) + time input (38%) |
| Option Set / Picklist | `<select>` with chevron bg | Custom arrow, no native appearance |
| Two Options (Yes/No) | `<select>` with Yes/No options | OR show as text "Yes" / "No" |
| Lookup | Styled link-text span | `color:#0078d4; cursor:pointer` |
| Read-only | Plain span `.plain-val` | No underline, no input |
| Empty / null | `<span class="empty-val">---</span>` | Color `#c8c6c4` |
| URL | Link-styled span | `color:#0078d4` |
| Email | Link-styled span | `color:#0078d4` |
| Phone | Link-styled span | `color:#0078d4` |

**Input focus behavior:** On `:focus`, border-bottom changes from `1px solid #c8c6c4` to `2px solid #0078d4`.

---

## D365 SECTION COMPONENT

```html
<div class="section">
  <!-- Header — clickable to collapse -->
  <div class="sec-hdr" onclick="toggleSec(this)"
       style="padding:10px 14px 8px; background:#faf9f8; cursor:pointer;
              display:flex; align-items:center; justify-content:space-between;">
    <span style="font-size:11px; font-weight:700; color:#323130;
                 text-transform:uppercase; letter-spacing:.5px;">SECTION TITLE</span>
    <span class="sec-chev" style="font-size:10px; color:#a19f9d; transition:transform .15s;">▾</span>
  </div>
  <!-- Body — collapsible -->
  <div class="sec-body">
    <!-- field-rows go here -->
  </div>
</div>
```

The `toggleSec(hdr)` JavaScript function:
```javascript
function toggleSec(hdr) {
  var body = hdr.nextElementSibling;
  var chev = hdr.querySelector('.sec-chev');
  if (!body) return;
  var collapsed = body.style.display === 'none';
  body.style.display = collapsed ? '' : 'none';
  if (chev) chev.style.transform = collapsed ? '' : 'rotate(-90deg)';
}
```

---

## D365 SUBGRID COMPONENT

```html
<div class="subgrid" style="border-top:1px solid #e1dfdd; background:#fff;">

  <!-- Subgrid Header -->
  <div style="display:flex; align-items:center; justify-content:space-between;
              padding:8px 14px 6px; background:#fff;">
    <span style="font-size:11px; font-weight:700; color:#323130;
                 text-transform:uppercase; letter-spacing:.4px;">SUBGRID TITLE</span>
    <div style="display:flex; align-items:center; gap:4px;">
      <!-- Refresh icon -->
      <button style="width:26px; height:26px; border:none; background:none; cursor:pointer;
                     border-radius:2px; font-size:13px; color:#a19f9d;">↺</button>
      <!-- New / Add button -->
      <button style="display:flex; align-items:center; gap:3px; padding:3px 8px;
                     font-size:12px; color:#0078d4; background:none; border:none;
                     cursor:pointer; border-radius:2px; font-family:inherit;">＋ New</button>
      <!-- More options -->
      <button style="width:26px; height:26px; border:none; background:none; cursor:pointer;
                     border-radius:2px; font-size:15px; color:#a19f9d;">⋯</button>
    </div>
  </div>

  <!-- Table -->
  <table style="width:100%; border-collapse:collapse; font-size:12px;">
    <thead>
      <tr>
        <th style="text-align:left; padding:5px 12px; background:#faf9f8;
                   color:#605e5c; font-size:11px; font-weight:700;
                   border-bottom:1px solid #e1dfdd; white-space:nowrap; cursor:pointer;">
          Column Name <span style="color:#c8c6c4; font-size:9px;">↕</span>
        </th>
        <!-- more th -->
      </tr>
    </thead>
    <tbody>
      <tr>
        <!-- First cell is always a link -->
        <td style="padding:7px 12px; border-bottom:1px solid #f3f2f1;
                   color:#0078d4; cursor:pointer;">Record Name</td>
        <td style="padding:7px 12px; border-bottom:1px solid #f3f2f1; color:#1f1f1f;">Value</td>
      </tr>
    </tbody>
  </table>

  <!-- Footer -->
  <div style="padding:4px 12px; font-size:11px; color:#a19f9d; border-top:1px solid #f3f2f1;">
    Rows: 2
  </div>
</div>
```

**Empty state subgrid** (when no records exist):
```html
<div style="display:flex; flex-direction:column; align-items:center;
            justify-content:center; padding:28px; gap:8px;">
  <div style="width:48px; height:48px; border-radius:50%; background:#f3f2f1;
              display:flex; align-items:center; justify-content:center;">
    <!-- 4-square grid SVG icon -->
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#a19f9d" opacity=".5">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  </div>
  <div style="font-size:12px; color:#a19f9d;">We didn't find anything to show here</div>
</div>
<div style="padding:4px 12px; font-size:11px; color:#a19f9d; border-top:1px solid #f3f2f1;">
  Rows: 0
</div>
```

---

## D365 TIMELINE COMPONENT (Column 2)

The Timeline must always appear in Column 2 of the Summary tab. It must include:

1. **Header bar** — "Timeline" label (13px bold) + action icons: ＋ ▽ ≡ ↺ ⋯
2. **Search bar** — Search icon + "Search timeline" placeholder input
3. **Note entry row** — Pencil icon + "Enter a note..." input + 🖇 attach button
4. **Filter chips** — All | Emails | Calls | Meetings | Notes (pill buttons, active = `#eff6fc` bg + `#0078d4` border + text)
5. **Highlights section** — Collapsible row with the colorful Windows logo dot
6. **Recent header** — Clock icon + "Recent" label in `#a19f9d`
7. **Activity entries** — Each entry has:
   - Colored dot icon (30px circle): email=blue, call=green, meeting=purple, note=amber, system=grey
   - Title (12.5px bold) + metadata line (11px, `#a19f9d`) with linked author name
8. **Add Activity button** — Full-width, `#0078d4` text, 1px border `#e1dfdd`, hover bg `#eff6fc`

Timeline entry types and their colors:
| Activity | Circle bg | Icon | Example |
|----------|-----------|------|---------|
| Email | `#eff6fc` / `#0078d4` | ✉ | "Email sent – Subject" |
| Phone Call | `#e6f4ea` / `#107c10` | ☎ | "Call with [Contact Name]" |
| Meeting | `#f3e9fc` / `#8764b8` | ◉ | "Meeting – Subject" |
| Note | `#fff4ce` / `#835c00` | ✎ | "Note: body text" |
| Task | `#f3f2f1` / `#605e5c` | ✓ | "Task: description" |
| System Post | `#f3f2f1` / `#605e5c` | ⚙ | "Auto-post on [Entity]: [date]" |

Reference: https://learn.microsoft.com/en-us/dynamics365/customerengagement/on-premises/basics/work-with-activities

---

## D365 STATUS PILLS

```html
<!-- Active / Enabled -->
<span style="display:inline-flex; align-items:center; padding:1px 8px; border-radius:12px;
             font-size:11px; font-weight:600; background:#dff6dd; color:#107c10;">Active</span>

<!-- Inactive / Disabled -->
<span style="... background:#f3f2f1; color:#605e5c;">Inactive</span>

<!-- Pending / Info -->
<span style="... background:#eff6fc; color:#0078d4;">Pending</span>

<!-- Warning / In Progress -->
<span style="... background:#fff4ce; color:#835c00;">In Progress</span>

<!-- Error / Rejected -->
<span style="... background:#fde7e9; color:#a4262c;">Rejected</span>
```

---

## REQUIRED JAVASCRIPT BEHAVIORS

Include ALL of these in every generated form:

```javascript
// 1. Tab switching
function switchTab(name, el) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  el.classList.add('active');
  document.getElementById('formArea').scrollTo({top:0, behavior:'smooth'});
}

// 2. Section collapse/expand
function toggleSec(hdr) {
  var body = hdr.nextElementSibling;
  var chev = hdr.querySelector('.sec-chev');
  var collapsed = body.style.display === 'none';
  body.style.display = collapsed ? '' : 'none';
  if (chev) chev.style.transform = collapsed ? '' : 'rotate(-90deg)';
}

// 3. Unsaved changes detection
var dirty = false;
document.querySelectorAll('input, select, textarea').forEach(function(el) {
  el.addEventListener('change', function() {
    if (!dirty) {
      dirty = true;
      document.getElementById('unsavedBar').style.display = 'flex';
      document.getElementById('unsavedLabel').style.display = 'inline';
    }
  });
});

// 4. Save button feedback
function saveForm() {
  dirty = false;
  document.getElementById('unsavedBar').style.display = 'none';
  document.getElementById('unsavedLabel').style.display = 'none';
  var btn = document.querySelector('.cb-save');
  var orig = btn.innerHTML;
  btn.style.background = '#dff6dd';
  btn.style.color = '#107c10';
  btn.innerHTML = '✓ Saved';
  setTimeout(function() {
    btn.innerHTML = orig; btn.style.background = ''; btn.style.color = '';
  }, 2000);
}

// 5. Timeline filter
function filterTl(btn) {
  document.querySelectorAll('.tl-filter-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
}

// 6. Scroll to top button
var fa = document.getElementById('formArea');
var tt = document.getElementById('toTop');
if (fa && tt) {
  fa.addEventListener('scroll', function() {
    tt.classList.toggle('vis', fa.scrollTop > 200);
  });
}
```

---

## UNSAVED CHANGES BANNER

Place this directly above the command bar. Hidden by default, shown when `dirty = true`:

```html
<div id="unsavedBar" style="display:none; background:#fff4ce; border-bottom:1px solid #e0c800;
     padding:6px 16px; font-size:12px; color:#604d00; align-items:center; gap:6px;">
  ⚠ Unsaved changes – remember to save before leaving this page
</div>
```

---

## SCROLL TO TOP BUTTON

Fixed position, appears after 200px scroll:

```html
<button id="toTop" onclick="document.getElementById('formArea').scrollTo({top:0,behavior:'smooth'})"
  style="position:fixed; bottom:18px; right:18px; z-index:100; width:34px; height:34px;
         border-radius:50%; background:#0078d4; border:none; cursor:pointer;
         display:flex; align-items:center; justify-content:center;
         box-shadow:0 2px 8px rgba(0,120,212,.35); opacity:0; transition:opacity .2s;">
  ▲
</button>
<!-- JS: document.getElementById('toTop').classList.toggle('vis', scrollTop > 200) -->
```

---

---

# ═══════════════════════════════════════════════
# FORM SPECIFICATION  (fill this in per table)
# ═══════════════════════════════════════════════

Replace everything in `[SQUARE BRACKETS]` with your actual values before submitting.

```
TABLE NAME:           [e.g. Contact, Lead, Opportunity, Custom_Territory__c]
TABLE TYPE:           [Standard OOB | Custom]
DISPLAY NAME:         [e.g. Contact, Sales Territory, Service Request]
PLURAL NAME:          [e.g. Contacts, Sales Territories, Service Requests]
MODULE / APP:         [e.g. Sales Hub, Customer Service Hub, Field Service]
ENVIRONMENT LABEL:    [SANDBOX | PRODUCTION | DEV]
RECORD TITLE:         [e.g. Tom Abbey, Q3 Enterprise Deal, REQ-00421]
AVATAR INITIALS:      [e.g. TA, QD, SR]
AVATAR COLOR:         [hex code, or use default #038387]

TABS (in order):
  Tab 1: [Name] — [brief: "summary fields + timeline"]
  Tab 2: [Name] — [brief: "related records grid"]
  Tab 3: [Name] — [brief: "custom section fields"]
  ... add as many as needed

COLUMN 1 SECTIONS + FIELDS (for Summary tab):

  Section: [Section Name]
  Fields:
    - [Field Label] | [Type: text/lookup/picklist/date/currency/yes-no/phone/email/url] | [Required: yes/no] | [Sample value]
    - [Field Label] | [Type] | [Required] | [Sample value]
    ... 

  Section: [Section Name 2]
  Fields:
    - ...

SUBGRIDS IN COLUMN 1 (below fields):
  - [Subgrid Title] | Columns: [col1, col2, col3] | Sample rows: [2 rows of data]

COLUMN 3 PANELS (right side, top to bottom):
  - [Panel Name, e.g. "Assistant"] | Fields: [field1, field2]
  - [Panel Name, e.g. "Company"] | Type: lookup | Sample: [value]
  - [Subgrid Name] | Columns: [col1, col2] | Sample rows: [2 rows]
  - [Notifications panel: yes/no]

OTHER TABS CONTENT:
  Tab: [Name]
    Layout: [2-column fields | side-by-side subgrids | single subgrid]
    Left section: [Section name + fields]
    Right: [Subgrid or fields]

COMMAND BAR BUTTONS:
  [List the relevant action buttons for this entity, e.g: New, Save, Activate, Qualify Lead, Close Opportunity, Resolve Case, etc.]
  Reference for standard buttons per entity: https://learn.microsoft.com/en-us/dynamics365/customerengagement/on-premises/customize/configure-action-bar

STATUS / LIFECYCLE:
  Status options: [e.g. Active, Inactive | Open, Won, Lost | New, In Progress, Resolved]
  Current status in mockup: [e.g. Active]
  Status reason: [e.g. Active, Qualified, Closed]

OWNER FIELD: [Name of the owner shown in record header, e.g. "John Mitchell"]

QUICK-VIEW FIELDS (shown in record header, right side, 3–4 fields):
  - [Field 1 label] | [Sample value]
  - [Field 2 label] | [Sample value]
  - [Field 3 label] | [Sample value]

SAMPLE TIMELINE ENTRIES (4–5 entries):
  - [Type: email/call/meeting/note/task] | [Title] | [Date] | [Author]
  - ...
```

---

---

# ═══════════════════════════════════════════════
# EXAMPLE — Filled specification for Contact table
# ═══════════════════════════════════════════════

```
TABLE NAME:           Contact
TABLE TYPE:           Standard OOB
DISPLAY NAME:         Contact
PLURAL NAME:          Contacts
MODULE / APP:         Sales Hub
ENVIRONMENT LABEL:    SANDBOX
RECORD TITLE:         Tom Abbey
AVATAR INITIALS:      TA
AVATAR COLOR:         #038387

TABS:
  Tab 1: Summary — Contact info fields + timeline + right panel
  Tab 2: Details — Additional fields + related grids
  Tab 3: PCG — Custom PCG fields
  Tab 4: Scheduling — Scheduling fields
  Tab 5: Files — Documents
  Tab 6: Related ▾ — Related entities dropdown

COLUMN 1 SECTIONS + FIELDS (Summary tab):
  Section: Contact Information
  Fields:
    - First Name | text | required | Tom
    - Middle Name | text | no | ---
    - Last Name | text | required | Abbey
    - Job Title | text | no | Contractor
    - Email Opt Out | yes-no | no | No
    - Created By | lookup | no | Siddhraj Dave (Offline)
    - Created On | date+time | no | 3/17/2026 | 2:29 PM
    - Modified By | lookup | no | D365CRMPowerAutomate-ReadWrite-nonprod
    - Modified On | date+time | no | 3/18/2026 | 5:56 PM
    - Division | lookup | no | Protective & Marine
    - Lead Initiated | yes-no | no | No
    - Marketing Opt In | yes-no | no | No
    - Marketo Hard Bounce | yes-no | no | No
    - Opt In Permission | yes-no | no | No
    - Business Phone | phone | no | ---
    - Mobile Phone | phone | no | 567894321
    - Fax | text | no | ---
    - Address 1: Street 1 | text | no | 17, Markwood
    - Address 1: Street 2 | text | no | ---

COLUMN 3 PANELS:
  - Who Knows Whom | Type: info panel | Message: "No email found. Add an email address for Tom Abbey to see common connections."
  - Assistant | Fields: [none – empty]
  - Notifications | Type: empty state | Message: "No notifications or suggestions. Check back later."
  - Company | Type: lookup | Sample: ---
  - Opportunities subgrid | Columns: Topic, Est. Revenue, Est. Close Date, Actual Revenue | 0 rows (empty state)
  - Cases subgrid | Columns: Case Title, Case Number, Priority, Origin | 0 rows (empty state)

COMMAND BAR BUTTONS: New, Activate, Open org chart, Connect, Assign, Refresh, Check Access, Process ▾, Follow, Flow ▾, Word Templates ▾, Run Report ▾

STATUS: Active / Inactive | Current: Inactive
OWNER: Siddhraj Dave
QUICK-VIEW FIELDS: Owner | Siddhraj Dave | Status | Inactive | Status Reason | ---

SAMPLE TIMELINE ENTRIES:
  - system | Auto-post on Contact Tom Abbey: Contact created by Siddhraj Dave | 3/17/2026, 2:29 PM | System
```

---

---

# ═══════════════════════════════════════════════
# QA CHECKLIST — Verify every generated form
# ═══════════════════════════════════════════════

After generating, verify each item. If any fail, prompt the AI to fix them specifically.

### Visual Fidelity
- [ ] Top nav background is `#1b2a4a` (dark navy), NOT `#0078d4` (blue)
- [ ] Font is Segoe UI throughout (not Inter, not Arial, not Roboto)
- [ ] Field rows use alternating `#f9f8f7` / `#ffffff` background
- [ ] Field labels are `#605e5c`, field values are `#1f1f1f`
- [ ] Section headers are `11px`, `700 weight`, `uppercase`, `#323130` on `#faf9f8` bg
- [ ] All borders are `#e1dfdd` (outer) or `#f3f2f1` (inner separators)
- [ ] Active tab has `#0078d4` underline, NOT a box/card highlight
- [ ] Status pills use correct bg/text color pairs (green for Active, amber for Warning, etc.)
- [ ] Subgrid column headers are `11px`, uppercase-looking, `700 weight`, `#605e5c`
- [ ] Timeline dot circles are correctly colored per activity type
- [ ] Record avatar is a 42px circle with initials
- [ ] Required fields show `*` in `#a4262c`
- [ ] Lookup values are styled as `#0078d4` links

### Layout
- [ ] 3-column layout is present on Summary tab (Col 1 = fields, Col 2 = timeline, Col 3 = right panel)
- [ ] Column proportions are approximately 38% / 38% / 24%
- [ ] Left sidebar (200px) is present with correct nav groups
- [ ] Form body is scrollable; top nav and record header stay fixed
- [ ] Three columns each scroll independently

### Interactivity
- [ ] All tab buttons switch the visible content
- [ ] All section headers collapse/expand their body on click
- [ ] Editing any field triggers the unsaved-changes yellow banner
- [ ] "· Unsaved" label appears in the record header title when dirty
- [ ] Save button shows green "✓ Saved" feedback for ~2 seconds
- [ ] Timeline filter buttons (All / Emails / Calls / etc.) toggle active state
- [ ] Scroll-to-top button appears after scrolling 200px in form area

### Content
- [ ] All fields have plausible sample data (not lorem ipsum, not "Test Value")
- [ ] All subgrids have at least 2 sample rows (or proper D365 empty state)
- [ ] Timeline has at least 4 entries of mixed types
- [ ] Breadcrumb shows correct entity name and view

### References consulted (if patterns were unclear)
- Main form design: https://learn.microsoft.com/en-us/power-apps/maker/model-driven-apps/main-form-presentations
- Form sections & tabs: https://learn.microsoft.com/en-us/power-apps/maker/model-driven-apps/form-editor-overview
- Command bar: https://learn.microsoft.com/en-us/dynamics365/customerengagement/on-premises/customize/configure-action-bar
- Timeline control: https://learn.microsoft.com/en-us/dynamics365/customerengagement/on-premises/basics/work-with-activities
- Subgrid control: https://learn.microsoft.com/en-us/power-apps/maker/model-driven-apps/sub-grid-properties-legacy
- Standard entity field reference: https://learn.microsoft.com/en-us/dynamics365/customerengagement/on-premises/developer/entities/account

---

## TIPS FOR CUSTOM TABLES

When generating forms for **custom tables** (those not in the standard D365 schema):

1. **Prefix fields** with the solution publisher prefix (e.g. `cr7a_fieldname`) in comments, but show clean display names in the form.
2. **Infer field types** from the field name — e.g. a field named "Approval Date" → date type; "Is Active" → yes/no; "Parent Account" → lookup.
3. **Group fields logically** into sections even if the spec lists them flat. D365 best practice is 5–10 fields per section.
4. **Always add an Owner field** in the record header — every D365 entity has one.
5. **Add a Status/Status Reason** pair — every entity has a state model.
6. **Decide the column layout** based on entity purpose:
   - Data-entry heavy → 3-column with timeline
   - Reference/lookup heavy → 2-column with subgrids on the right
   - Hierarchy/relationship → Pattern C (side-by-side subgrids)
7. **Custom entity avatar color** — choose a color that isn't `#038387` (teal, used for Contact). Good choices: `#0078d4` (blue), `#8764b8` (purple), `#107c10` (green), `#ca5010` (orange).
8. Reference for custom entity design best practices: https://learn.microsoft.com/en-us/power-apps/maker/model-driven-apps/design-considerations-main-forms

---

*End of prompt — version 1.0 | Generated from CBG Distribution Inc. Account form reference implementation*
