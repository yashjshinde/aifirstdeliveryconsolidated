# DevOps and ALM — Reporting

## 1. Deployment Pipeline (Power BI)

All Power BI content must be deployed through a three-stage deployment pipeline:

```
DEV Workspace  →  UAT Workspace  →  PROD Workspace
    (develop)        (test/UAT)        (live)
```

- Promotion from DEV to UAT requires: spec APPROVED + FDD complete.
- Promotion from UAT to PROD requires: test plan executed + UAT sign-off.
- The deployment pipeline service principal must have Admin access to all three workspaces.
- Deployment pipeline rules must be configured to disallow direct publish to UAT or PROD.

## 2. Source Control

### Power BI (PBIX)
- All PBIX files must be committed to the project Git repository under `output/{feature}/reports/`.
- For datasets with TMDL support: commit TMDL source files rather than the binary PBIX for the data model. Commit the PBIX for the report layer.
- Git branch strategy: `feature/{feature-name}` → `dev` → `main`. No direct commits to `main`.

### SSRS / Paginated (RDL)
- All RDL files must be committed to Git under `output/{feature}/rdl/`.
- SQL stored procedures used by the report must be committed to `output/{feature}/sql/`.
- Shared data sources must be committed as `.rds` files.

## 3. CI/CD Pipeline

### Power BI CI/CD
- Use Power BI REST API + Azure DevOps pipeline for automated deployment.
- Pipeline stages: Validate PBIX → Deploy to DEV → Run smoke tests → Promote to UAT → UAT gate → Promote to PROD.
- Smoke tests: verify dataset refresh completes, report renders without error.

### SSRS CI/CD
- Use RS.exe or PowerShell `ReportingServicesTools` module for automated deployment to SSRS server.
- Stored procedure deployment via SSMS or Azure DevOps SQL task.
- Pipeline stages: Deploy RDL → Deploy stored procedures → Run smoke tests → Sign off for PROD.

## 4. Dataset Refresh Configuration

- Dataset refresh must be configured via Power BI REST API in the deployment pipeline — not manually in the portal.
- Refresh credentials must be stored in Azure Key Vault and injected into the pipeline.
- Incremental refresh partition configuration must be documented in the TDD.
- Refresh failure alerts must be configured in Power BI Service (email to designated DL).

## 5. Version Control and Rollback

- Every PROD deployment must be tagged in Git: `release/{feature-name}/v{N}.{N}`.
- Rollback procedure: redeploy the previous release tag via the deployment pipeline — never manually overwrite content in PROD workspace.
- Dataset schema changes that break existing reports must be flagged as breaking changes and coordinated with all report consumers before deployment.

## 6. Environment Configuration

- Workspace IDs, dataset IDs, and gateway IDs must be stored as pipeline variables — never hardcoded.
- Data source connection strings must differ per environment (DEV/UAT/PROD).
- The `10-alm-configuration.md` file stores default workspace names and pipeline IDs for this project.

## 7. Naming and Asset Registry

Maintain an asset registry at `docs-generated/{feature}/asset-registry.md`:

| Asset Name | Type | Workspace | Dataset Dependency | Refresh Schedule | Owner |
|---|---|---|---|---|---|
| {ReportName} | Interactive / Paginated / SSRS | {Workspace} | {DatasetName} | Daily 06:00 | {Owner} |
