# Reporting Agent Constitution — Index

This directory defines the hard constraints and standards the Reporting agent must follow.
All commands read every file in this directory before generating output.

| File | Topic | Summary |
|---|---|---|
| `00-architectural-principles.md` | Core principles | Evidence-based documentation, inference rules, flagging conventions, report type selection |
| `01-report-design-standards.md` | Report design | When to use Power BI vs SSRS vs Paginated; layout, visual, and UX standards |
| `02-data-model-standards.md` | Data modelling | Star schema, DirectQuery vs Import vs Composite, relationship design, table naming |
| `03-power-bi-standards.md` | Power BI | DAX standards, visual standards, workspace organisation, dataflow reuse |
| `04-ssrs-paginated-standards.md` | SSRS / Paginated | Report layout, parameters, subreports, subscriptions, export formats |
| `05-security-standards.md` | Security | RLS design patterns, workspace permissions, sensitivity labels, guest access |
| `06-devops-alm.md` | ALM / DevOps | Deployment pipelines, workspace ALM, PBIX vs thin report, CI/CD for RDL |
| `07-testing-standards.md` | Testing | Visual regression, DAX unit testing, data accuracy validation, UAT checklist |
| `08-document-generation-rules.md` | Documentation | Tone, format, completeness rules for all generated documents |
| `09-nfr-targets.md` | NFR targets | Default performance, availability, and data freshness targets |
| `10-alm-configuration.md` | ALM configuration | ADO connection settings, work item hierarchy, ID prefixes |
