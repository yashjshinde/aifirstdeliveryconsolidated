# Constitution — Testing Standards (Power Apps)

## Canvas App Testing
- Use **Power Apps Test Studio** for automated canvas app tests
- Test file: one `.te` file per app screen
- Minimum tests per screen: happy path navigation, required field validation, data submit
- Test cases must cover accessibility: keyboard navigation and required labels

## Model-Driven App Testing
- Use **EasyRepro** for automated UI testing of model-driven apps
- Test scenarios: form load, save, Business Rule triggers, view filtering
- Every Business Rule must have a test case in the test suite

## Power Automate Testing
- Use **Test Flow** feature in the flow editor for manual testing
- Automated: use the Power Automate Test framework or mock HTTP endpoints
- Every flow must have test cases for: happy path, error path (action fails), timeout
- Flow test results must be documented in `test-cases.md`

## Copilot Studio Testing
- Every topic: test in Test Canvas for happy path + no-match + escalation
- Use **analytics** after publishing to identify low CSAT and unanswered sessions
- Document test conversations in `test-cases.md`

## Test Naming
- Test case ID: TC-{NNN}
- Test name: `{Component} — {Scenario} — {Expected Result}`

## Performance Testing
- Every feature with Canvas App screens on large datasets, real-time flows, or synchronous plugins must include performance test cases in the test plan
- Tool: **Power Apps Monitor** for canvas app profiling; **Azure Load Testing** for flow and API throughput tests
- Performance tests must run against a **production-like dataset** — never against an empty or near-empty environment
- Pass thresholds are defined in `11-nfr-targets.md`:
  - Canvas screen load ≤ 3s on warm instance; all OnVisible queries ≤ 2s
  - User-triggered flow ≤ 5s end-to-end; batch flow completes within scheduled window + 20% buffer
  - MDA form load ≤ 2s; form save ≤ 3s
- Delegation boundary tests: load test data must include > 500 records for every table tested for delegation compliance
- Performance tests must pass before deployment to UAT — failures logged as High priority defects; UAT is blocked until resolved

## Test Environment Rules
- Automated tests run against the **Test environment** — never Development or Production
- Clean up test data after each test run
- Integration tests must not depend on manually created test records
