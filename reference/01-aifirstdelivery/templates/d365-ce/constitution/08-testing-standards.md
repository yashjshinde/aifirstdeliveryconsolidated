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

## Multilingual Testing
- For every language in `supported-languages` (declared in `10-alm-configuration.md`):
  - Run **smoke tests** of the primary forms, email templates, and exception messages.
  - Verify date / number / currency formatting per the user's locale (e.g., comma-decimal `1.234,56` vs period-decimal `1,234.56`).
- **Pseudo-localization** is run before translator engagement (e.g., `qps-PLOC`) to surface hardcoded strings, layout truncation, and concatenation bugs. CI failure if pseudo-loc reveals hardcoded strings.
- All test scripts (UI automation, integration, performance) reference **schema names**, never display names. Localised display names changing across releases must not break tests.
- Email template tests verify the recipient-language template selection logic — one test per supported language.
- See `15-multilingual-localization.md` §13 for full rules.

## Right-to-Left (RTL) Testing
When the supported set includes any RTL language (Arabic, Hebrew, Persian, Urdu):
- Capture a screenshot of every customised form / PCF / mobile form per release in **both LTR and RTL** UI direction.
- Verify Schedule Board PCF cells mirror correctly under RTL.
- RTL screenshots are attached to the FDD §6 Localization Matrix.

## Field Service Testing
When the project includes Field Service:
- Schedule Board load test: ≤ 50 resources, 7-day view, default tab — must load in ≤ 3 s.
- Schedule Assistant search response (typical scope) — must return matches in ≤ 5 s.
- Mobile sync test: full sync of < 200K records — must complete in ≤ 5 minutes; incremental sync ≤ 30 s.
- RSO single-pass optimisation (≤ 500 requirements) — must complete in ≤ 15 minutes.
- IoT alert → Work Order creation — must complete in ≤ 60 s end-to-end.
- Mobile offline DB size test: with all language packs in `supported-languages` enabled, measured offline DB size must remain under the 1 GB ceiling. Multilingual offline metadata grows ~10% per language pack — count it.
- See `13-field-service-scheduling-and-mobile.md` §7 for the full FS NFR set.
