export interface AdoConfig {
  orgUrl: string;
  project: string;
  pat: string;
}

export interface WorkItemCreate {
  type: string;
  title: string;
  description?: string;
  areaPath?: string;
  iterationPath?: string;
  parentId?: number;
  assignedTo?: string;
  tags?: string;
  acceptanceCriteria?: string;
  priority?: number;
  storyPoints?: number;
}

export interface WorkItemResult {
  id: number;
  url: string;
  title: string;
  type: string;
  state: string;
}

export interface BulkWorkItemInput {
  type: string;
  title: string;
  description?: string;
  acceptanceCriteria?: string;
  priority?: number;
  storyPoints?: number;
  tags?: string;
  parentRef?: string;
  ref?: string;
}

export interface TestStep {
  step: number;
  action: string;
  expected: string;
}

export interface TestCaseCreate {
  title: string;
  steps: TestStep[];
  areaPath?: string;
  assignedTo?: string;
  priority?: number;
  automationStatus?: string;
}

export interface TestSuiteCreate {
  planId: number;
  name: string;
  parentSuiteId?: number;
}

export interface TestPlanCreate {
  name: string;
  areaPath?: string;
  iteration?: string;
  startDate?: string;
  endDate?: string;
}

export interface WikiPage {
  id?: string;
  path: string;
  content?: string;
  eTag?: string;
  url?: string;
}

export interface Pipeline {
  id: number;
  name: string;
  folder: string;
  url: string;
}

export interface PipelineRun {
  id: number;
  name: string;
  state: string;
  result?: string;
  createdDate: string;
  finishedDate?: string;
  url: string;
}

export interface Repository {
  id: string;
  name: string;
  defaultBranch: string;
  remoteUrl: string;
  webUrl: string;
}

export interface PullRequest {
  pullRequestId: number;
  title: string;
  description?: string;
  status: string;
  sourceRefName: string;
  targetRefName: string;
  createdBy: string;
  creationDate: string;
  url: string;
}
