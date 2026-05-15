# Constitution — Testing Standards

## Plugin Unit Tests
- Framework: **FakeXrmEasy 3.x** (or latest stable)
- Test project name: `{SolutionName}.Plugins.Tests`
- Every plugin class must have a corresponding test class
- Minimum **80% line coverage** for all plugin code

## Test Naming
- Class: `{PluginClassName}Tests`
- Method: `{MethodName}_When{Condition}_Should{ExpectedResult}`
  - Example: `Execute_WhenAccountNameIsEmpty_ShouldThrowInvalidPluginExecutionException`

## Test Structure (AAA)
Every test must follow Arrange / Act / Assert:
```
// Arrange
var ctx = new XrmFakedContext();
// ... set up entities and context

// Act
ctx.ExecutePluginWithTarget<MyPlugin>(target);

// Assert
Assert.Equal(expected, actual);
```

## What to Test
- Happy path: valid input → expected output/side effect
- Validation failures: invalid input → correct `InvalidPluginExecutionException` message
- Edge cases: null inputs, empty collections, depth > 1
- Pre/post image consumption: correct attribute read from correct image
- Service calls: verify the correct Dataverse operations were called (using FakeXrmEasy assertions)

## What NOT to Unit Test
- Dataverse platform behaviour (e.g., cascade rules) — that is integration testing
- OOB plugin pipeline ordering — test only your own plugin in isolation

## Integration Tests
- Run against a dedicated **integration test environment** — never Dev, UAT, or Production
- Clean up all created test records in teardown
- Mark integration tests with `[Trait("Category", "Integration")]`

## JavaScript Testing
- Use **Jest** for JS web resource unit tests
- Mock `Xrm` API using a jest mock module
- Test form script functions in isolation — do not test Xrm platform behaviour

## PCF Testing
- Use Jest with `@microsoft/pcf-scripts test`
- Test each lifecycle method independently
- Mock `ComponentFramework.Context` fully

## Performance Testing
- Every feature with synchronous plugins, real-time flows, or Canvas App screens on large datasets must include performance test cases in the test plan
- Tool: **Easy Repro** or **Azure Load Testing** — document the chosen tool in the test plan
- Performance test must be run against a **production-like dataset** (same record volumes and relationships) — never against an empty environment
- Pass thresholds (from `11-nfr-targets.md`):
  - Form load ≤ 2s, form save ≤ 3s, synchronous plugin ≤ 2s under 50 concurrent users
  - Batch operations ≤ 500ms/record at 1,000 records/minute sustained
- Performance test must pass before any deployment to UAT
- Failures must be logged as bugs with priority High — UAT is blocked until resolved
