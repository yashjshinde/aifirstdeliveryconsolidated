import axios, { type AxiosInstance } from "axios";
import type { AdoConfig } from "../types/index.js";

export function getAdoConfig(): AdoConfig {
  const orgUrl = process.env.ADO_ORG_URL?.replace(/\/$/, "");
  const project = process.env.ADO_PROJECT;
  const pat = process.env.ADO_PAT;

  if (!orgUrl || !project || !pat) {
    throw new Error(
      "Missing required environment variables: ADO_ORG_URL, ADO_PROJECT, ADO_PAT"
    );
  }

  return { orgUrl, project, pat };
}

export function createAdoClient(config: AdoConfig): AxiosInstance {
  const token = Buffer.from(`:${config.pat}`).toString("base64");
  return axios.create({
    baseURL: `${config.orgUrl}/${encodeURIComponent(config.project)}/_apis`,
    headers: {
      Authorization: `Basic ${token}`,
      Accept: "application/json",
    },
  });
}

// Org-level client for cross-project operations (e.g. resolving project GUIDs)
export function createOrgClient(config: AdoConfig): AxiosInstance {
  const token = Buffer.from(`:${config.pat}`).toString("base64");
  return axios.create({
    baseURL: `${config.orgUrl}/_apis`,
    headers: {
      Authorization: `Basic ${token}`,
      Accept: "application/json",
    },
  });
}

// Wraps any ADO API call and surfaces structured error details instead of raw Axios stack traces
export async function callAdo<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      const status = err.response.status;
      const body = err.response.data as Record<string, unknown> | undefined;
      const message =
        (body?.message as string) ??
        ((body?.value as Record<string, unknown>)?.Message as string) ??
        `HTTP ${status}`;
      const code =
        (body?.errorCode as string) ??
        (body?.typeKey as string) ??
        `HTTP_${status}`;
      throw new Error(JSON.stringify({ error: { code, message, status } }));
    }
    throw err;
  }
}

export function markdownToHtml(md: string): string {
  return md
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

export function buildTestStepsXml(steps: Array<{ step: number; action: string; expected: string }>): string {
  const stepElements = steps
    .map(
      (s, i) => `<step id="${i + 2}" type="ActionStep">
    <parameterizedString isformatted="true"><![CDATA[<p>${s.action}</p>]]></parameterizedString>
    <parameterizedString isformatted="true"><![CDATA[<p>${s.expected}</p>]]></parameterizedString>
    <description/>
  </step>`
    )
    .join("\n  ");

  return `<steps id="0" last="${steps.length + 1}">\n  ${stepElements}\n</steps>`;
}
