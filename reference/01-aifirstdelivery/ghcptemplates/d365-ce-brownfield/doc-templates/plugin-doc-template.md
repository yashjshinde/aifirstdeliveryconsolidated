# {AssemblyName} — Plugin Documentation

| Property | Value |
|---|---|
| Assembly | {AssemblyName}.dll |
| Version | {version} |
| Isolation Mode | Sandbox / None |
| Solution | {solution-name} v{solution-version} |
| Generated | {date} |
| Source | C# source + solution XML registration |

---

## Assembly Overview

**Namespace:** `{root namespace}`
**NuGet dependencies:** {list key dependencies e.g. Microsoft.CrmSdk.CoreAssemblies 9.0.2.x}
**External service calls:** {list or "None detected"}

---

## Plugin Classes

---

### {PluginClassName}

**Namespace:** `{Namespace.PluginClassName}`
**Purpose:** {one-sentence description of what this plugin does}

#### Registered Steps

| Entity | Message | Stage | Mode | Filtering Attributes | Rank |
|---|---|---|---|---|---|
| account | Create | Pre-Operation | Synchronous | — | 1 |
| account | Update | Pre-Operation | Synchronous | `pub_taxcode, name` | 1 |

#### Images

| Image Name | Type | Attributes |
|---|---|---|
| PreImage | Pre-Image | `pub_taxcode, name, statecode` |

#### Business Logic

**Trigger conditions checked:**
- Runs only on Create: `if (context.MessageName == "Create")`
- Skips if depth > 1: `if (context.Depth > 1) return;`

**Inputs read:**
- `Target["pub_taxcode"]` — the tax code being set
- `PreImage["pub_taxcode"]` — the previous value (on Update steps)

**Operations performed:**
1. Validates `pub_taxcode` format using regex `^[A-Z]{2}[0-9]{6}$`
2. If invalid: throws `InvalidPluginExecutionException("Tax code format is invalid. Expected: XX999999")`
3. If valid: sets `Target["pub_isvalidated"] = true`
4. Retrieves linked account using `service.Retrieve("account", accountId, columns)` — checks credit limit

**Dataverse calls:**
| Operation | Table | Fields / Filter |
|---|---|---|
| `Retrieve` | account | `pub_creditlimit`, `creditonhold` |
| `Update` | pub_example | `pub_isvalidated` = true |

**External service calls:** None

**Error handling:**
- `InvalidPluginExecutionException`: user-facing validation message
- General exceptions: logged via `tracingService.Trace()` — not surfaced to user

#### Key Code Excerpt

```csharp
public void Execute(IServiceProvider serviceProvider)
{
    var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
    var service = ((IOrganizationServiceFactory)serviceProvider.GetService(
        typeof(IOrganizationServiceFactory))).CreateOrganizationService(context.UserId);
    var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

    if (context.Depth > 1) return;

    var target = (Entity)context.InputParameters["Target"];
    // ... (truncated — see source file)
}
```

#### Flags

- `⚠ UPGRADE RISK` — Synchronous Post-Operation calls external HTTP (line 87): may be blocked by Microsoft sandbox changes

---

## Documentation Gaps

| Component | Gap | Reason |
|---|---|---|
| `{ClassName}` | Logic partially documented | Binary DLL only — no source available |
