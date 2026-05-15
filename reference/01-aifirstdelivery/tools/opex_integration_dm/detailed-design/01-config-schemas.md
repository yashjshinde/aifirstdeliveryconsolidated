# 01 — Config JSON Schemas + validate-config CI Gate

This document is the **contract** between mapping authors and the runtime engine. Every JSON file under `/config/` is validated against the schemas below before it is consumed by any pipeline. `tools/validate-config` is a thin CLI/CI gate that runs both the schema validation and the cross-file rule catalog at the end of this doc.

## 1. Config files in scope

| File | Schema | When loaded |
| --- | --- | --- |
| `/config/_project.json` | [§2 — project.schema.json](#2-project-schema) | Once per pipeline run, before any entity work |
| `/config/entities/<entityKey>.json` | [§3 — entity-mapping.schema.json](#3-entity-mapping-schema) | Once per entity orchestrator invocation |
| `/config/waves/<waveKey>.json` | [§4 — wave.schema.json](#4-wave-schema) | Once per wave orchestrator invocation |
| `/config/aliases/<refTable>__<refField>.json` | [§5 — alias-file.schema.json](#5-alias-file-schema) | Lazily, when an entity field references `aliasesFile` |

All four schemas share these conventions:

- `additionalProperties: false` everywhere — typo protection.
- All `description` fields are kept short and target the mapping author.
- Patterns/enums prefer narrow sets so the validator catches drift early.
- No `$ref` to external URLs; every `$ref` is intra-document.

---

## 2. Project schema

`project.schema.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "opex-integration/project.schema.json",
  "title": "Project-level settings",
  "type": "object",
  "additionalProperties": false,
  "required": ["batchSize", "retry", "notification"],
  "properties": {
    "schedules": {
      "type": "object",
      "description": "Logical schedule definitions; one ADF schedule trigger is materialized per entry.",
      "additionalProperties": { "$ref": "#/$defs/scheduleEntry" }
    },
    "batchSize":          { "type": "integer", "minimum": 1, "maximum": 10000, "default": 500 },
    "outboundPageSize":   { "type": "integer", "minimum": 100, "maximum": 50000, "default": 5000 },
    "masterCacheTtlMinutes": { "type": "integer", "minimum": 0, "default": 240 },
    "retry": {
      "type": "object",
      "additionalProperties": false,
      "required": ["maxAttempts", "backoffSec"],
      "properties": {
        "maxAttempts":  { "type": "integer", "minimum": 1, "maximum": 20, "default": 5 },
        "backoffSec":   { "type": "integer", "minimum": 1, "maximum": 600, "default": 30 },
        "exponential":  { "type": "boolean", "default": true },
        "jitter":       { "type": "boolean", "default": true }
      }
    },
    "createMissingLookupsDefault": { "type": "boolean", "default": false },
    "partialLoadAllowed":          { "type": "boolean", "default": true },
    "failureThresholdPct":         { "type": "number", "minimum": 0, "maximum": 100, "default": 5 },
    "notification": { "$ref": "#/$defs/notification" }
  },
  "$defs": {
    "scheduleEntry": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "direction"],
      "properties": {
        "type":      { "enum": ["daily", "everyNHours", "oneTime", "manual"] },
        "atUtc":     { "type": "string", "pattern": "^([01]\\d|2[0-3]):[0-5]\\d$" },
        "n":         { "type": "integer", "minimum": 1, "maximum": 24 },
        "startUtc":  { "type": "string", "format": "date-time" },
        "direction": { "enum": ["inbound", "outbound"] }
      },
      "allOf": [
        { "if": { "properties": { "type": { "const": "daily" } } },
          "then": { "required": ["atUtc"] } },
        { "if": { "properties": { "type": { "const": "everyNHours" } } },
          "then": { "required": ["n"] } },
        { "if": { "properties": { "type": { "const": "oneTime" } } },
          "then": { "required": ["startUtc"] } }
      ]
    },
    "notification": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "onFailure":   { "type": "array", "items": { "enum": ["email", "teams"] } },
        "onPartial":   { "type": "array", "items": { "enum": ["email", "teams"] } },
        "onSlaBreach": { "type": "array", "items": { "enum": ["email", "teams"] } },
        "slaMinutes":  { "type": "integer", "minimum": 1 },
        "to":          { "type": "array", "items": { "type": "string", "format": "email" } },
        "teamsWebhookSecretName": { "type": "string", "pattern": "^kv-[a-z0-9-]+$" }
      }
    }
  }
}
```

**Worked example — a valid `_project.json`**

```jsonc
{
  "schedules": {
    "customer_inbound":  { "type": "daily",       "atUtc": "02:00", "direction": "inbound"  },
    "customer_outbound": { "type": "everyNHours", "n": 4,           "direction": "outbound" }
  },
  "batchSize": 500,
  "retry": { "maxAttempts": 5, "backoffSec": 30, "exponential": true, "jitter": true },
  "createMissingLookupsDefault": false,
  "partialLoadAllowed": true,
  "failureThresholdPct": 5,
  "notification": {
    "onFailure": ["email", "teams"],
    "onPartial": ["email"],
    "to": ["dataops@example.com"],
    "teamsWebhookSecretName": "kv-teams-webhook"
  }
}
```

---

## 3. Entity-mapping schema

`entity-mapping.schema.json` — the largest schema and the one mapping authors touch most. Modeled with `$defs` for each transform type so the rules stay close to the data they describe.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "opex-integration/entity-mapping.schema.json",
  "title": "Per-entity mapping configuration",
  "type": "object",
  "additionalProperties": false,
  "required": ["entityKey", "direction", "source", "target", "fields"],
  "properties": {
    "entityKey":  { "type": "string", "pattern": "^[a-z][a-z0-9_]{2,40}$" },
    "direction":  { "enum": ["inbound", "outbound", "bidirectional"] },
    "source":     { "$ref": "#/$defs/fileEndpoint" },
    "target":     { "$ref": "#/$defs/dataverseEndpoint" },
    "dedup":      { "$ref": "#/$defs/dedup" },
    "dateTime":   {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "defaultTimeZone": { "type": "string", "default": "UTC" },
        "format":          { "type": "string", "default": "yyyy-MM-dd HH:mm:ss" }
      }
    },
    "lookups": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "createMissingDefault": { "type": "boolean" }
      }
    },
    "fields":          { "type": "array", "items": { "$ref": "#/$defs/field" }, "minItems": 1 },
    "relationships":   { "type": "array", "items": { "$ref": "#/$defs/relationship" } },
    "postLoadActions": { "type": "array", "items": { "$ref": "#/$defs/postLoadAction" } }
  },
  "allOf": [
    {
      "if": {
        "type": "object",
        "required": ["direction"],
        "properties": { "direction": { "const": "inbound" } }
      },
      "then": {
        "properties": {
          "source": { "type": "object", "required": ["inbound"] },
          "target": { "type": "object", "required": ["inbound"] }
        }
      }
    },
    {
      "if": {
        "type": "object",
        "required": ["direction"],
        "properties": { "direction": { "const": "outbound" } }
      },
      "then": {
        "properties": {
          "source": { "type": "object", "required": ["outbound"] },
          "target": { "type": "object", "required": ["outbound"] }
        }
      }
    },
    {
      "if": {
        "type": "object",
        "required": ["direction"],
        "properties": { "direction": { "const": "bidirectional" } }
      },
      "then": {
        "properties": {
          "source": { "type": "object", "required": ["inbound", "outbound"] },
          "target": { "type": "object", "required": ["inbound", "outbound"] }
        }
      }
    }
  ],
  "$comment": "The if/then blocks above use the defensive pattern: each `if` declares `required` plus `properties` on the discriminator (so the condition fires correctly), and each `then` re-asserts `type:object` on the subject keys (so the inner `required` is applied even though source/target are also referenced via $ref). Verified against Ajv 2020 strict mode and JsonSchema.Net.",
  "$defs": {
    "fileEndpoint": {
      "type": "object",
      "additionalProperties": false,
      "required": ["system", "format", "sftpLinkedService"],
      "properties": {
        "system":            { "const": "SFTP" },
        "format":            { "enum": ["csv", "xlsx"] },
        "sftpLinkedService": { "type": "string", "pattern": "^ls_sftp_[a-z0-9_]+$" },
        "delimiter":         { "type": "string", "minLength": 1, "maxLength": 4, "default": "," },
        "encoding":          { "enum": ["utf-8", "utf-8-bom", "windows-1252", "iso-8859-1"], "default": "utf-8" },
        "headerRow":         { "type": "integer", "minimum": 1, "default": 1 },
        "inbound": {
          "type": "object",
          "additionalProperties": false,
          "required": ["pathPattern"],
          "properties": {
            "pathPattern":     { "type": "string", "minLength": 1 },
            "worksheet":       { "type": ["string", "null"] },
            "archiveTo":       { "type": "string" },
            "onMultipleFiles": { "enum": ["concat", "latestOnly", "fail"], "default": "concat" }
          }
        },
        "outbound": {
          "type": "object",
          "additionalProperties": false,
          "required": ["pathPattern"],
          "properties": {
            "pathPattern":         { "type": "string" },
            "worksheet":           { "type": ["string", "null"] },
            "writeHeaderRow":      { "type": "boolean", "default": true },
            "emptyFileBehavior":   { "enum": ["writeHeaderOnly", "skipFile", "fail"], "default": "writeHeaderOnly" }
          }
        }
      }
    },
    "dataverseEndpoint": {
      "type": "object",
      "additionalProperties": false,
      "required": ["system", "entityLogicalName", "alternateKey"],
      "properties": {
        "system":            { "const": "Dataverse" },
        "entityLogicalName": { "type": "string", "pattern": "^[a-z_][a-z0-9_]*$" },
        "alternateKey":      { "type": "array", "items": { "type": "string" }, "minItems": 1 },
        "inbound": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "writeMode":     { "enum": ["upsert", "create", "update"], "default": "upsert" },
            "bypassPlugins": { "type": "boolean", "default": false }
          }
        },
        "outbound": {
          "type": "object",
          "additionalProperties": false,
          "required": ["query"],
          "properties": {
            "query": {
              "type": "object",
              "additionalProperties": false,
              "required": ["mode"],
              "properties": {
                "mode":         { "enum": ["odataFilter", "fetchXml", "savedView"] },
                "odataFilter":  { "type": ["string", "null"] },
                "fetchXml":     { "type": ["string", "null"] },
                "savedView":    { "type": ["string", "null"] },
                "orderBy":      { "type": "string" },
                "pageSize":     { "type": "integer", "minimum": 100, "maximum": 50000, "default": 5000 },
                "maxRows":      { "type": ["integer", "null"], "minimum": 1 }
              }
            },
            "delta": {
              "type": "object",
              "additionalProperties": false,
              "properties": {
                "enabled":              { "type": "boolean", "default": true },
                "watermarkStore":       { "type": "string" },
                "watermarkField":       { "type": "string" },
                "initialFromUtc":       { "type": "string", "format": "date-time" },
                "fullModeOverrideParam":{ "type": "string", "default": "forceFull" }
              }
            },
            "expand": {
              "type": "array",
              "items": {
                "type": "object",
                "additionalProperties": false,
                "required": ["navigationProperty", "select"],
                "properties": {
                  "navigationProperty": { "type": "string" },
                  "select":             { "type": "array", "items": { "type": "string" }, "minItems": 1 }
                }
              }
            }
          }
        }
      }
    },
    "dedup": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "enabled":         { "type": "boolean", "default": true },
        "checksumColumns": { "type": "array", "items": { "type": "string" } },
        "onDuplicate":     { "enum": ["keepLatest", "keepFirst", "fail"], "default": "keepLatest" }
      }
    },
    "field": {
      "type": "object",
      "additionalProperties": false,
      "required": ["source", "target", "targetType", "transform"],
      "properties": {
        "source":          { "type": "string", "minLength": 1 },
        "sourceType":      { "enum": ["text", "int", "decimal", "date", "datetime", "bool"] },
        "target":          { "type": "string", "minLength": 1 },
        "targetType":      { "enum": ["text", "int", "decimal", "datetime", "dateonly", "bool", "choice", "state", "lookup"] },
        "maxLength":       { "type": ["integer", "null"], "minimum": 1 },
        "mandatory":       { "type": "boolean", "default": false },
        "defaultValue":    {},
        "validations":     { "type": "array", "items": { "type": "string" } },
        "inboundInclude":  { "type": "boolean", "default": true },
        "outboundInclude": { "type": "boolean", "default": true },
        "loadPhase":       { "type": "integer", "enum": [1, 2], "default": 1 },
        "transform":       { "$ref": "#/$defs/transform" }
      }
    },
    "transform": {
      "type": "object",
      "required": ["type"],
      "$comment": "Discriminated union over `type`. The previous allOf+if/then form was unreliable across validators because the conditional `properties.forward.$ref` did not consistently combine with the base `properties.forward.{type:object}`. The oneOf form below is the standard 2020-12 pattern for tagged unions and works in Ajv strict, JsonSchema.Net, and python-jsonschema.",
      "oneOf": [
        {
          "additionalProperties": false,
          "properties": {
            "type":    { "const": "direct" },
            "forward": { "type": "object" },
            "reverse": { "type": "object" }
          }
        },
        {
          "additionalProperties": false,
          "required": ["type", "forward", "reverse"],
          "properties": {
            "type":    { "const": "concat" },
            "forward": { "$ref": "#/$defs/tfConcatForward" },
            "reverse": { "$ref": "#/$defs/tfConcatReverse" }
          }
        },
        {
          "additionalProperties": false,
          "required": ["type", "forward", "reverse"],
          "properties": {
            "type":    { "const": "split" },
            "forward": { "$ref": "#/$defs/tfSplitForward" },
            "reverse": { "$ref": "#/$defs/tfSplitReverse" }
          }
        },
        {
          "additionalProperties": false,
          "required": ["type", "forward"],
          "properties": {
            "type":    { "const": "conditional" },
            "forward": { "$ref": "#/$defs/tfConditionalForward" },
            "reverse": { "$ref": "#/$defs/tfConditionalReverse" }
          }
        },
        {
          "additionalProperties": false,
          "required": ["type", "forward"],
          "properties": {
            "type":    { "const": "map" },
            "forward": { "$ref": "#/$defs/tfMapForward" },
            "reverse": { "type": "object" }
          }
        },
        {
          "additionalProperties": false,
          "required": ["type", "forward"],
          "properties": {
            "type":    { "const": "choice" },
            "forward": { "$ref": "#/$defs/tfChoiceForward" },
            "reverse": { "type": "object" }
          }
        },
        {
          "additionalProperties": false,
          "required": ["type", "forward"],
          "properties": {
            "type":    { "const": "state" },
            "forward": { "$ref": "#/$defs/tfStateForward" },
            "reverse": { "type": "object" }
          }
        },
        {
          "additionalProperties": false,
          "required": ["type", "forward"],
          "properties": {
            "type":    { "const": "yesNo" },
            "forward": { "$ref": "#/$defs/tfYesNoForward" },
            "reverse": { "type": "object" }
          }
        },
        {
          "additionalProperties": false,
          "required": ["type", "forward"],
          "properties": {
            "type":    { "const": "dateTime" },
            "forward": { "$ref": "#/$defs/tfDateTimeForward" },
            "reverse": { "type": "object" }
          }
        },
        {
          "additionalProperties": false,
          "required": ["type", "forward"],
          "properties": {
            "type":    { "const": "lookup" },
            "forward": { "$ref": "#/$defs/tfLookupForward" },
            "reverse": { "type": "object" }
          }
        }
      ]
    },

    "tfConcatForward": {
      "type": "object",
      "additionalProperties": false,
      "required": ["inputs", "separator", "target"],
      "properties": {
        "inputs":    { "type": "array", "items": { "type": "string" }, "minItems": 2 },
        "separator": { "type": "string" },
        "target":    { "type": "string" }
      }
    },
    "tfConcatReverse": {
      "type": "object",
      "additionalProperties": false,
      "required": ["input", "regex"],
      "properties": {
        "input": { "type": "string" },
        "regex": { "type": "string" }
      }
    },
    "tfSplitForward": {
      "type": "object",
      "additionalProperties": false,
      "required": ["input", "regex", "outputs"],
      "properties": {
        "input":   { "type": "string" },
        "regex":   { "type": "string" },
        "outputs": { "type": "array", "items": { "type": "string" }, "minItems": 1 }
      }
    },
    "tfSplitReverse": {
      "type": "object",
      "additionalProperties": false,
      "required": ["inputs", "separator"],
      "properties": {
        "inputs":    { "type": "array", "items": { "type": "string" }, "minItems": 2 },
        "separator": { "type": "string" }
      }
    },
    "tfConditionalForward": {
      "type": "object",
      "additionalProperties": false,
      "required": ["rules"],
      "properties": {
        "rules": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["when", "value"],
            "properties": {
              "when":  { "type": "string" },
              "value": {}
            }
          },
          "minItems": 1
        },
        "default": {}
      }
    },
    "tfConditionalReverse": {
      "type": "object",
      "additionalProperties": false,
      "required": ["writes"],
      "properties": {
        "writes": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["column", "value", "when"],
            "properties": {
              "column":    { "type": "string" },
              "value":     {},
              "when":      { "type": "string" },
              "elseValue": {}
            }
          },
          "minItems": 1
        }
      }
    },
    "tfMapForward": {
      "type": "object",
      "additionalProperties": false,
      "required": ["map"],
      "properties": {
        "map":           { "type": "object", "additionalProperties": true },
        "default":       {},
        "caseSensitive": { "type": "boolean", "default": true },
        "onMissing":     { "enum": ["fail", "useDefault", "passThrough"], "default": "fail" }
      }
    },
    "tfChoiceForward": {
      "type": "object",
      "additionalProperties": false,
      "required": ["map"],
      "properties": {
        "map":         { "type": "object", "additionalProperties": { "type": "integer" } },
        "default":     { "type": ["integer", "null"] },
        "onMissing":   { "enum": ["fail", "useDefault", "passThrough"], "default": "fail" },
        "normalize":   { "$ref": "#/$defs/normalizeRules" },
        "aliases":     { "type": "object", "additionalProperties": { "type": "string" } },
        "aliasesFile": { "type": "string", "pattern": "^/config/aliases/[a-z0-9_]+__[a-z0-9_]+\\.json$" },
        "onAliasMiss": { "enum": ["passThrough", "suggestion", "error"], "default": "passThrough" }
      }
    },
    "tfStateForward": {
      "type": "object",
      "additionalProperties": false,
      "required": ["map"],
      "properties": {
        "map":     { "type": "object", "additionalProperties": { "type": "integer" } },
        "default": { "type": ["integer", "null"] }
      }
    },
    "tfYesNoForward": {
      "type": "object",
      "additionalProperties": false,
      "required": ["trueValues", "falseValues"],
      "properties": {
        "trueValues":  { "type": "array", "items": { "type": "string" }, "minItems": 1 },
        "falseValues": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
        "outputTrue":  { "type": "boolean", "default": true },
        "outputFalse": { "type": "boolean", "default": false }
      }
    },
    "tfDateTimeForward": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "sourceTz":     { "type": "string", "default": "UTC" },
        "targetTz":     { "type": "string", "default": "UTC" },
        "inputFormat":  { "type": "string", "default": "yyyy-MM-dd HH:mm:ss" },
        "outputFormat": { "type": "string", "default": "yyyy-MM-ddTHH:mm:ssZ" }
      }
    },
    "tfLookupForward": {
      "type": "object",
      "additionalProperties": false,
      "required": ["referenceTable", "entitySetName", "navigationProperty", "refField"],
      "properties": {
        "referenceTable":     { "type": "string" },
        "entitySetName":      { "type": "string" },
        "navigationProperty": { "type": "string" },
        "refField":           { "type": "string" },
        "primaryIdField":     { "type": "string" },
        "matchPolicy":        { "enum": ["exact", "caseInsensitive", "trim"], "default": "exact" },
        "createIfMissing":    {
          "type": "boolean",
          "enum": [false],
          "default": false,
          "$comment": "v1 constraint: must be false. Auto-creating master rows requires pl_create_missing_masters which is deferred to v2. validate-config rule V028 enforces this."
        },
        "onMissing":          { "enum": ["error", "useDefault", "passNull", "suggestion"], "default": "error" },
        "nullBehavior":       { "enum": ["clear", "skip"], "default": "clear" },
        "default":            {},
        "createDefaults":     { "type": "object" },
        "cacheKey":           { "type": "string" },
        "filter":             { "type": "string" },
        "targetMode":         { "enum": ["system", "impersonate", "shadowField"], "default": "system" },
        "normalize":          { "$ref": "#/$defs/normalizeRules" },
        "aliases":            { "type": "object", "additionalProperties": { "type": "string" } },
        "aliasesFile":        { "type": "string", "pattern": "^/config/aliases/[a-z0-9_]+__[a-z0-9_]+\\.json$" },
        "onAliasMiss":        { "enum": ["passThrough", "suggestion", "error"], "default": "passThrough" }
      }
    },
    "normalizeRules": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^(trim|collapseWhitespace|toLowerCase|toUpperCase|stripPunctuation|stripDiacritics|removeRegex:.+)$"
      }
    },

    "relationship": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "relationshipSchemaName", "primaryEntity", "primaryKey", "relatedEntity", "relatedKey"],
      "properties": {
        "type":                   { "const": "NN" },
        "relationshipSchemaName": { "type": "string" },
        "primaryEntity":          { "type": "string" },
        "primaryKey": {
          "type": "object",
          "additionalProperties": false,
          "required": ["field", "source"],
          "properties": {
            "field":  { "type": "string" },
            "source": { "type": "string" }
          }
        },
        "relatedEntity": { "type": "string" },
        "relatedKey": {
          "type": "object",
          "additionalProperties": false,
          "required": ["field", "source"],
          "properties": {
            "field":  { "type": "string" },
            "source": { "type": "string" }
          }
        },
        "inbound": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "writeMode": { "enum": ["associate", "disassociate", "upsertAssociation"], "default": "associate" }
          }
        },
        "outbound": {
          "type": "object",
          "additionalProperties": false,
          "required": ["exportMode", "filePattern", "columns"],
          "properties": {
            "exportMode":  { "const": "separateFile" },
            "filePattern": { "type": "string" },
            "columns":     { "type": "array", "items": { "type": "string" }, "minItems": 2 }
          }
        }
      }
    },
    "postLoadAction": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type"],
      "properties": {
        "type":              { "enum": ["setLookup"] },
        "condition":         { "type": "string" },
        "targetEntity":      { "type": "string" },
        "targetLookupField": { "type": "string" },
        "valueFromSelf":     { "type": "string" }
      }
    }
  }
}
```

---

## 4. Wave schema

`wave.schema.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "opex-integration/wave.schema.json",
  "title": "Multi-entity wave configuration",
  "type": "object",
  "additionalProperties": false,
  "required": ["waveKey", "direction", "entities"],
  "properties": {
    "waveKey":   { "type": "string", "pattern": "^[a-z][a-z0-9_]{2,40}$" },
    "direction": { "enum": ["inbound", "outbound", "mixed"] },
    "entities": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["entityKey", "phase"],
        "properties": {
          "entityKey":  { "type": "string", "pattern": "^[a-z][a-z0-9_]{2,40}$" },
          "phase":      { "type": "integer", "minimum": 1, "maximum": 20 },
          "dependsOn":  { "type": "array", "items": { "type": "string" }, "default": [] },
          "concurrent": { "type": "boolean", "default": true }
        }
      }
    },
    "failurePolicy": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "onEntityFailure":         { "enum": ["stopWave", "continueIndependent", "continueAll"], "default": "continueIndependent" },
        "onDependencyFailure":     { "enum": ["skipDependent", "runAnyway"], "default": "skipDependent" },
        "wavePartialThresholdPct": { "type": "number", "minimum": 0, "maximum": 100, "default": 10 }
      }
    },
    "masterCacheRefresh": { "enum": ["never", "betweenPhases", "beforeEachEntity"], "default": "betweenPhases" },
    "configVersion":      { "enum": ["pinAtWaveStart", "latest"], "default": "latest" },
    "notification": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "onWaveFailure": { "type": "array", "items": { "enum": ["email", "teams"] } },
        "onWavePartial": { "type": "array", "items": { "enum": ["email", "teams"] } }
      }
    }
  }
}
```

---

## 5. Alias-file schema

`alias-file.schema.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "opex-integration/alias-file.schema.json",
  "title": "Externalized variant→canonical map",
  "type": "object",
  "additionalProperties": false,
  "required": ["refTable", "refField", "aliases"],
  "properties": {
    "refTable":  { "type": "string", "pattern": "^[a-z_][a-z0-9_]*$" },
    "refField":  { "type": "string", "pattern": "^[a-z_][a-z0-9_]*$" },
    "normalize": { "$ref": "opex-integration/entity-mapping.schema.json#/$defs/normalizeRules" },
    "aliases":   { "type": "object", "additionalProperties": { "type": "string" }, "minProperties": 1 }
  }
}
```

> The `$ref` to `normalizeRules` in `entity-mapping.schema.json` is the only cross-schema reference in the system. The validate-config tool resolves it from disk.

The file's **filename** is also part of the contract: it must match `^[a-z0-9_]+__[a-z0-9_]+\.json$`, where the two parts are `refTable` and `refField` joined by a double underscore. The validate-config tool enforces this (rule V025).

---

## 6. `validate-config` rule catalog

The CLI tool is invoked as:

```
tools/validate-config <config-root>            # validate everything under /config/
tools/validate-config <config-root> --strict   # treat warnings as errors (CI mode)
tools/validate-config --schema=entity --file=customer.json   # single-file
```

Output format is GitHub-Actions-compatible (`::error file=...,line=...,col=...::<message>`). Each rule is identified by a stable code (`V001`...) so CI logs can be searched and rules can be temporarily allowlisted in `.validate-config.allowlist` during phased rollout.

### 6.1 Schema-level rules (V0xx)

| Code | Severity | What it checks | Example failure |
| --- | --- | --- | --- |
| **V001** | error | JSON syntactically valid | Trailing comma in `customer.json` → `JSON parse error at line 27, col 5` |
| **V002** | error | Validates against the relevant JSON Schema | `direction` is `"in"` (not in enum) |
| **V003** | error | `additionalProperties:false` violation | Author typed `entitykey` instead of `entityKey` |
| **V004** | error | `entityKey` filename matches contents | `customer.json` has `"entityKey": "customers"` |
| **V005** | error | `waveKey` filename matches contents | `oracle_fusion_daily.json` has `"waveKey": "oracle_daily"` |
| **V006** | error | `_project.json.notification.to` not empty when `onFailure` includes `email` | `onFailure: ["email"]` but `to: []` |
| **V007** | warning | `_project.json.batchSize` outside Dataverse-recommended range (50–1000) | `batchSize: 5000` → throttling risk |

### 6.2 Cross-file rules (V01x)

| Code | Severity | What it checks | Example failure |
| --- | --- | --- | --- |
| **V010** | error | Every wave `entities[].entityKey` resolves to a file under `/config/entities/` | Wave references `customer` but no `customer.json` exists |
| **V011** | error | Every entity referenced by a wave has a `direction` compatible with the wave's `direction` (inbound wave → entities must be inbound or bidirectional) | Wave direction `inbound`, entity `customer.direction = outbound` |
| **V012** | error | Every field referencing `aliasesFile` resolves to a file under `/config/aliases/` | Field references `/config/aliases/opx_city__opx_cityname.json`, file missing |
| **V013** | error | Every `aliasesFile` content's `refTable`/`refField` matches a `lookup`/`choice`/`state` transform that imports it | Field imports alias file for `opx_city.opx_cityname` but its `forward.referenceTable` is `opx_country` |
| **V014** | warning | Entity declares a transform on a `lookup` or `choice` field but no `referenceTable` exists in any other entity or as a master prefetch target | Stale lookup whose master no longer exists |

### 6.3 Transform completeness rules (V02x)

| Code | Severity | What it checks | Example failure |
| --- | --- | --- | --- |
| **V020** | error | `concat`, `split`, `conditional` transforms require `reverse` block iff entity direction is `outbound` or `bidirectional` | `direction=outbound`, transform=conditional, no `reverse` → "missing reverse block" |
| **V021** | error | `map` transform's `forward.map` is 1:1 (no duplicate values) when reverse is auto-derived | `map: { "A": 1, "B": 1 }` triggers "ambiguous reverse — declare reverse.map explicitly" |
| **V022** | error | `choice` transform's `forward.map` values are integers in Dataverse's option-set range (1–2147483647) | `map: { "x": -5 }` |
| **V023** | error | `lookup` transform's `entitySetName` is plural-shaped (heuristic: ends in `s`, `es`, or has `_set` suffix) — warning only since DV plurals are irregular | `entitySetName: "opx_equipmentdiscount"` (singular) |
| **V024** | error | `lookup.aliases` keys appear in the order in which they're applied **after** `normalize` (warning if a key contains uppercase but normalize includes `toLowerCase`) | normalize=[toLowerCase], aliases={"NEW DELHI":"Delhi"} → unreachable rule |
| **V025** | error | Alias filename matches `<refTable>__<refField>.json` | `delhi-mapping.json` instead of `opx_city__opx_cityname.json` |
| **V026** | error | `lookup` transform whose `referenceTable == entity's target.entityLogicalName` (self-lookup) declares `loadPhase: 2` | Self-lookup with `loadPhase: 1` → would fail at runtime |
| **V027** | warning | Field with `transform.type=lookup` and `createIfMissing=true` but no `createDefaults` block | Auto-creating rows with only the alt-key populated (v2 only) |
| **V028** | error | `createIfMissing: true` declared on any field — **rejected in v1** | "createIfMissing=true is deferred to v2; pl_create_missing_masters not yet specified" |

### 6.4 Wave graph rules (V03x)

| Code | Severity | What it checks |
| --- | --- | --- |
| **V030** | error | `entities` form a DAG — no cycles in `dependsOn` |
| **V031** | error | Every `dependsOn` references an entity in the same wave |
| **V032** | error | Phase ordering is consistent with `dependsOn` — if A is in `B.dependsOn`, A's `phase` must be lower than B's |
| **V033** | error | All entities are reachable in some topological pass (no entity has `phase: 5` if max is 3 — fills phase gaps) |
| **V034** | warning | An N:N declared on entity X targets `relatedEntity` Y where Y is also in the wave but **not** in X's `dependsOn` |

### 6.5 Direction-specific rules (V04x)

| Code | Severity | What it checks |
| --- | --- | --- |
| **V040** | error | `direction=inbound`: every field's `inboundInclude` defaults to true; if all fields have `inboundInclude=false`, fail |
| **V041** | error | `direction=outbound`: `target.outbound.query` is non-null; if `mode=odataFilter`, `odataFilter` is non-empty; same for the other two modes |
| **V042** | error | `direction=outbound`: every `lookup` transform that should resolve at extract time **either** has a matching entry in `target.outbound.expand` **or** the field is marked `outboundInclude: false` |
| **V043** | warning | `direction=bidirectional`: every transform's `forward.map` (if any) has a declared `reverse.map` — automatic inversion is allowed but flagged so authors confirm the choice |

### 6.6 Operational rules (V05x)

| Code | Severity | What it checks |
| --- | --- | --- |
| **V050** | warning | `dedup.checksumColumns` overlaps `target.alternateKey` (redundant — alt-key dedup is implicit on upsert) |
| **V051** | warning | A transform-type-`dateTime` field declares `sourceTz` and `targetTz` both equal to `UTC` — the transform is a no-op, consider `direct` instead |
| **V052** | warning | `partialLoadAllowed: false` while `failureThresholdPct > 0` — the threshold is dead code |

### 6.7 Deferred / runtime checks (V06x, validate-config does NOT run these)

These are pre-flight assertions performed by `pl_preflight` at runtime, not by the static validator, because they need a live Dataverse connection:

| Code | Severity | What it checks |
| --- | --- | --- |
| **V060** | error | Every `target.entityLogicalName` exists in Dataverse |
| **V061** | error | Every `field.target` exists as an attribute on `target.entityLogicalName` |
| **V062** | error | Every `lookup.entitySetName` and `lookup.navigationProperty` exists per `EntityDefinitions` |
| **V063** | error | Every `alternateKey` is a real alternate key on the target entity |
| **V064** | error | Every N:N `relationshipSchemaName` exists on `primaryEntity` |
| **V065** | warning | Every master prefetched has unique `refField` values (master quality check) |

---

## 7. Rule severity policy

- **error**: blocks merge in CI; `validate-config` exits non-zero.
- **warning**: surfaced in CI logs but does not block; the team should review and either fix or add to the allowlist with a justification line.

The `.validate-config.allowlist` is a flat text file:

```
# entity-level allowlist; format: <rule>,<file>,<json-pointer>,<reason>
V023,customer.json,/fields/8/transform/forward/entitySetName,"opx_country is irregular plural"
V051,site.json,/fields/12/transform/forward,"sourceTz=targetTz is intentional placeholder, will be wired Q3"
```

CI fails if any entry has been in the allowlist for more than **90 days** — the warning must either be fixed or the policy explicitly revisited.

---

## 8. Schema versioning

- Each schema's `$id` is **stable** for the lifetime of the framework; breaking changes get a major version increment (`opex-integration/entity-mapping.v2.schema.json`).
- Configs may declare `$schemaVersion: "1"` at the top of each JSON file (optional in v1; required from v2 onward).
- The `validate-config` tool resolves the schema version per-file and routes to the correct validator. Mixed-version configs are allowed during migration.

---

## 9. Authoring workflow

1. Business analyst edits the source mapping workbook.
2. `tools/excel_to_json/` converts each sheet to `/config/entities/<entityKey>.json`. The converter:
   - Maps the workbook's column headers to JSON properties (see `tools/excel_to_json/header-map.json`).
   - Infers `transform.type` from the "Transformation Logic" column using a deterministic ruleset.
   - Leaves manual fields (e.g. `entitySetName`, `navigationProperty`) blank — they require human review.
3. Author commits the JSON.
4. CI runs `tools/validate-config --strict` and blocks on any V0xx error.
5. On merge, the deployment pipeline (out of scope here) publishes `/config/` to the runtime ADLS path.

---

## 10. Test fixtures included in the repo

`tools/validate-config/test-fixtures/` contains, for each rule code Vxxx:
- `Vxxx-pass/`: a config that satisfies the rule.
- `Vxxx-fail/`: a config that violates the rule, plus the expected error message in `expected.txt`.

The test suite asserts every rule has both a pass and a fail fixture; coverage is enforced in CI.
