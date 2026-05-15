/**
 * Unit tests for schema-validate — confirms each of the 6 v1 schemas loads + validates a sample.
 * Run from the repo root (or any sub-folder under it) so findRepoRoot() picks up agents.yaml.
 */

import { describe, it, expect } from "vitest";
import { validate } from "../src/lib/schema-validate.js";

describe("project-config.v1 schema", () => {
  it("accepts a minimal valid project.config.yaml shape", () => {
    const cfg = {
      name: "acme-d365",
      mode: "greenfield",
      "agents-enabled": ["d365-ce", "integration"],
      alm: {
        tool: "ado",
        hierarchy: ["Epic", "Feature", "User Story", "Task"],
      },
    };
    const r = validate("project-config.v1.json", cfg);
    expect(r.valid).toBe(true);
  });

  it("rejects brownfield mode without brownfieldPath", () => {
    const cfg = {
      name: "acme",
      mode: "brownfield",
      "agents-enabled": ["d365-ce"],
      alm: { tool: "ado", hierarchy: ["Epic"] },
    };
    const r = validate("project-config.v1.json", cfg);
    expect(r.valid).toBe(false);
  });

  it("rejects empty agents-enabled", () => {
    const cfg = {
      name: "x",
      mode: "greenfield",
      "agents-enabled": [],
      alm: { tool: "ado", hierarchy: ["Epic"] },
    };
    const r = validate("project-config.v1.json", cfg);
    expect(r.valid).toBe(false);
  });
});

describe("workflow-state.v1 schema", () => {
  it("accepts a fresh DEFINE-phase state", () => {
    const state = {
      schemaVersion: "1.0",
      project: "acme",
      agent: "d365-ce",
      feature: "case-mgmt",
      phase: "DEFINE",
      currentStates: ["SPEC_DRAFT"],
      gates: {
        SPEC_APPROVED: { status: "PENDING" },
      },
    };
    const r = validate("workflow-state.v1.json", state);
    expect(r.valid).toBe(true);
  });

  it("rejects unknown state name", () => {
    const state = {
      schemaVersion: "1.0",
      project: "acme",
      agent: "d365-ce",
      feature: "x",
      phase: "DEFINE",
      currentStates: ["UNKNOWN_STATE"],
      gates: { SPEC_APPROVED: { status: "PENDING" } },
    };
    const r = validate("workflow-state.v1.json", state);
    expect(r.valid).toBe(false);
  });
});

describe("handoff.v1 schema", () => {
  it("accepts a spec-split handoff", () => {
    const h = {
      schemaVersion: "1.0",
      id: "case-mgmt-integration-001",
      project: "acme",
      sourceAgent: "d365-ce",
      targetAgent: "integration",
      feature: "case-mgmt",
      artifactType: "spec-split",
      status: "READY",
      created: "2026-05-14T12:00:00Z",
      payload: { reason: "integration concerns flagged" },
    };
    const r = validate("handoff.v1.json", h);
    expect(r.valid).toBe(true);
  });

  it("rejects unknown artifactType", () => {
    const h = {
      schemaVersion: "1.0",
      id: "x-001",
      project: "acme",
      sourceAgent: "d365-ce",
      targetAgent: "integration",
      artifactType: "not-a-real-type",
      status: "READY",
      created: "2026-05-14T12:00:00Z",
    };
    const r = validate("handoff.v1.json", h);
    expect(r.valid).toBe(false);
  });
});

describe("work-items.v1 schema", () => {
  it("accepts a minimal hierarchy", () => {
    const wi = {
      schemaVersion: "1.0",
      project: "acme",
      agents: {
        "d365-ce": {
          features: {
            "case-mgmt": {
              L1: [
                {
                  uid: "ce-cm-L1-01",
                  title: "Case Management Implementation",
                  "alm-type": "Epic",
                },
              ],
            },
          },
        },
      },
    };
    const r = validate("work-items.v1.json", wi);
    expect(r.valid).toBe(true);
  });
});

describe("alm-extract.v1 schema", () => {
  it("accepts a minimal extract", () => {
    const ext = {
      schemaVersion: "1.0",
      project: "acme",
      agent: "d365-ce",
      feature: "case-mgmt",
      items: [
        {
          uid: "ce-cm-L1-01",
          title: "Case Management Implementation",
          "alm-type": "Epic",
          level: "L1",
        },
      ],
    };
    const r = validate("alm-extract.v1.json", ext);
    expect(r.valid).toBe(true);
  });
});

describe("brownfield-inventory.v1 schema", () => {
  it("accepts a minimal inventory", () => {
    const inv = {
      schemaVersion: "1.0",
      project: "acme",
      scannedAt: "2026-05-14T12:00:00Z",
      platforms: {
        "d365-ce": {
          entity: [
            {
              name: "account",
              sourceRef: "Entities/Account/Entity.xml:1",
            },
          ],
        },
      },
    };
    const r = validate("brownfield-inventory.v1.json", inv);
    expect(r.valid).toBe(true);
  });
});
