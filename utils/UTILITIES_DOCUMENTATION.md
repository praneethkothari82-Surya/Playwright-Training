# Playwright Test Utilities Documentation

This document provides detailed explanations of all custom utility functions and reporters used in this Playwright testing framework.

---

## Table of Contents
1. [simpleHTMLReporter.js](#simplehtmlreporterjs)
2. [testHelpers.js](#testhelpersjs)
3. [workerReporter.js](#workerreporterjs)

---

## simpleHTMLReporter.js

### Purpose
A **CSP-friendly HTML reporter** that generates beautiful, interactive test reports without external JavaScript dependencies. This reporter is specifically designed to work in Jenkins environments where Content Security Policy (CSP) restrictions prevent the default Playwright HTML report from loading.

### Class: `SimpleHTMLReporter`

#### Constructor
```javascript
constructor(options = {})
```
**Parameters:**
- `options.outputFile` (string, optional): Path where the HTML report will be saved
  - Default: `'test-results/simple-report.html'`

**Usage:**
```javascript
// In playwright.config.ts
reporter: [
  ['./utils/simpleHTMLReporter.js', { outputFile: 'test-results/simple-report.html' }]
]
```

---

### Methods

#### 1. `onBegin(config, suite)`
**Purpose:** Called when the test run starts. Initializes the reporter state.

**Parameters:**
- `config`: Playwright configuration object
- `suite`: Test suite structure

**What it does:**
- Stores the test suite reference
- Records the start time for duration calculation
- Initializes an empty results array

**Internal Variables Set:**
- `this.suite` - Test suite structure
- `this.startTime` - Timestamp when tests began
- `this.results` - Array to collect test results

---

#### 2. `onTestEnd(test, result)`
**Purpose:** Called after each individual test completes. Collects test data.

**Parameters:**
- `test`: Test object containing title, location, annotations
- `result`: Result object with status, duration, error details

**What it does:**
- Captures test title, status (passed/failed/skipped), duration
- Records error messages if test failed
- Stores file location (path:line)
- Collects test annotations/tags

**Data Structure Pushed to `this.results`:**
```javascript
{
  title: 'Test name',
  status: 'passed|failed|skipped',
  duration: 1234, // milliseconds
  error: 'Error message if failed' || null,
  location: 'tests/login.spec.js:25',
  annotations: [{type: '@SmokeTest'}]
}
```

---

#### 3. `async onEnd(result)`
**Purpose:** Called when all tests finish. Generates and saves the HTML report.

**Parameters:**
- `result`: Final test run result with overall status

**What it does:**
1. Calculates total duration
2. Counts passed, failed, and skipped tests
3. Generates complete HTML report
4. Creates output directory if it doesn't exist
5. Writes HTML file to disk
6. Logs confirmation message

**Statistics Calculated:**
- `total` - Total number of tests
- `passed` - Number of passed tests
- `failed` - Number of failed tests
- `skipped` - Number of skipped tests
- `duration` - Total run time in milliseconds

---

#### 4. `generateHTML(data)`
**Purpose:** Generates the complete HTML markup for the report.

**Parameters:**
- `data`: Object containing test statistics and results

**Data Object Structure:**
```javascript
{
  total: 10,
  passed: 8,
  failed: 1,
  skipped: 1,
  duration: 45678,
  results: [...], // Array of test results
  timestamp: '2025-11-14T10:30:00.000Z'
}
```

**HTML Features:**
- **Header Section**: Title, timestamp, total duration
- **Statistics Cards**: Color-coded counters for total/passed/failed/skipped
- **Test List**: Expandable test items (click to see details)
- **Test Details**: File location, tags, error messages
- **Inline CSS**: All styles embedded (no external files needed)
- **No JavaScript**: Pure HTML/CSS for CSP compliance

**Visual Design:**
- Green for passed tests ✓
- Red for failed tests ✗
- Orange for skipped tests ○
- Gradient purple header
- Clean, modern card-based layout

---

#### 5. `escapeHtml(text)`
**Purpose:** Sanitizes text to prevent XSS attacks and display issues.

**Parameters:**
- `text` (string): Raw text that may contain HTML characters

**Returns:** Safely escaped HTML string

**Conversions:**
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&#039;`

**Why it's needed:**
- Prevents test titles/error messages from breaking HTML
- Security protection against injection attacks
- Ensures special characters display correctly

---

### Usage Example

**In `playwright.config.ts`:**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['html', { open: 'never' }], // Default Playwright report
    ['./utils/simpleHTMLReporter.js', { 
      outputFile: 'test-results/simple-report.html' 
    }],
  ],
});
```

**In Jenkins Pipeline:**
```groovy
publishHTML([
  reportDir: 'test-results',
  reportFiles: 'simple-report.html',
  reportName: 'Playwright Simple Report'
])
```

---

## testHelpers.js

### Purpose
Provides reusable utility functions for enhanced test logging, retry mechanisms, and automatic failure screenshots. Improves test debugging and parallel execution visibility.

---

### Functions

#### 1. `enhancedTest(name, options, testFn)`
**Purpose:** Wrapper around Playwright's `test()` that adds automatic failure handling and screenshots.

**Parameters:**
- `name` (string): Test name/title
- `options` (object, optional): Test options (timeout, tag, etc.)
- `testFn` (async function): The actual test function

**Signature Variations:**
```javascript
// With options
enhancedTest('My test', { tag: '@SmokeTest' }, async ({ page }, testInfo) => {
  // test code
});

// Without options (options parameter becomes the test function)
enhancedTest('My test', async ({ page }, testInfo) => {
  // test code
});
```

**What it does:**

1. **Before Test:**
   - Extracts worker index from `testInfo.parallelIndex`
   - Logs: `[Worker 0] Starting test: My test`

2. **During Test:**
   - Executes your test function
   - Passes `{ page }` and `testInfo` to your test

3. **On Success:**
   - Logs: `[Worker 0] Test passed: My test`

4. **On Failure:**
   - Logs worker and test name
   - Logs error message
   - **Takes full-page screenshot** automatically
   - Saves screenshot: `test-results/failure-My-test-1234567890.png`
   - Attaches screenshot to test report
   - Logs current page URL
   - Logs current page title
   - Re-throws error (so test still fails)

**Benefits:**
- Automatic failure screenshots
- No need to manually add screenshots in every test
- Worker visibility in logs
- Enhanced error context (URL + title)

**Usage Example:**
```javascript
const { enhancedTest } = require('../utils/testHelpers');

enhancedTest('Login test', { tag: '@SmokeTest' }, async ({ page }, testInfo) => {
  await page.goto('/login');
  await page.fill('#email', 'test@example.com');
  await page.click('#submit');
  // If this fails, screenshot is automatically captured
});
```

---

#### 2. `retryAction(action, maxRetries, actionName, testInfo)`
**Purpose:** Retries a flaky action up to a specified number of times with automatic logging.

**Parameters:**
- `action` (async function): The action to retry
- `maxRetries` (number, default: 3): Maximum number of attempts
- `actionName` (string, default: 'Action'): Name for logging
- `testInfo` (object, optional): Playwright testInfo for worker index

**What it does:**

1. **Attempts the action** up to `maxRetries` times
2. **Logs each attempt:**
   - `[W0]   ↻ Navigate to Register - Attempt 1`
   - `[W0]   ↻ Navigate to Register - Attempt 2`
3. **On Success:**
   - Logs: `[W0]   ✓ Navigate to Register - Success`
   - Returns immediately (no more retries)
4. **On Failure:**
   - Logs: `[W0]   ✗ Navigate to Register - Failed: Element not found`
   - Waits 1 second before next retry
   - If all retries exhausted, throws the last error

**Icon Legend:**
- `↻` - Retry attempt
- `✓` - Success
- `✗` - Failure

**Worker Prefix:**
- If `testInfo` provided: Shows `[W0]` (worker 0), `[W1]`, etc.
- If `testInfo` is `null`: No prefix shown

**Usage Example:**
```javascript
const { retryAction } = require('../utils/testHelpers');

test('Flaky navigation', async ({ page }, testInfo) => {
  await retryAction(
    async () => {
      await page.click('#menu-button');
      await page.waitForSelector('#dropdown', { timeout: 2000 });
    },
    3,
    'Open dropdown menu',
    testInfo
  );
});
```

**Output:**
```
[W0]   ↻ Open dropdown menu - Attempt 1
[W0]   ✗ Open dropdown menu - Failed: Timeout 2000ms exceeded
[W0]   ↻ Open dropdown menu - Attempt 2
[W0]   ✓ Open dropdown menu - Success
```

**When to use:**
- Network-dependent actions
- Animations that might cause timing issues
- Third-party integrations
- Actions that occasionally fail due to race conditions

---

#### 3. `logStep(stepName, action, testInfo)`
**Purpose:** Wraps a test step with clean, visual logging for better test readability.

**Parameters:**
- `stepName` (string): Description of the step
- `action` (async function): The step action to perform
- `testInfo` (object, optional): Playwright testInfo for worker index

**What it does:**

1. **Before Action:**
   - Logs: `[W0]   → Generate email`

2. **Executes Action:**
   - Runs your async function
   - Captures return value

3. **On Success:**
   - Logs: `[W0]   ✓ Generate email`
   - Returns the action's return value

4. **On Failure:**
   - Logs: `[W0]   ✗ Generate email: Element not found`
   - Throws the error (test fails)

**Icon Legend:**
- `→` - Step starting
- `✓` - Step completed successfully
- `✗` - Step failed

**Worker Prefix:**
- If `testInfo` provided: Shows `[W0]`, `[W1]`, `[W2]`
- If `testInfo` is `null`: No prefix shown

**Usage Example:**
```javascript
const { logStep } = require('../utils/testHelpers');

test('User registration', async ({ page }, testInfo) => {
  let email;

  await logStep('Generate email', async () => {
    email = `test${Date.now()}@example.com`;
  }, testInfo);

  await logStep('Navigate to register page', async () => {
    await page.click('#register-link');
    await page.waitForURL('**/register');
  }, testInfo);

  await logStep('Fill registration form', async () => {
    await page.fill('#email', email);
    await page.fill('#password', 'Password123');
    await page.click('#submit');
  }, testInfo);
});
```

**Output:**
```
[W0]   → Generate email
[W0]   ✓ Generate email
[W0]   → Navigate to register page
[W0]   ✓ Navigate to register page
[W0]   → Fill registration form
[W0]   ✓ Fill registration form
```

**Benefits:**
- Clean, hierarchical test output
- Easy to identify which step failed
- Visual separation of test steps
- Worker index shows parallel execution

---

### Module Exports
```javascript
module.exports = {
  enhancedTest,
  retryAction,
  logStep
};
```

**Import Examples:**
```javascript
// Import all helpers
const { enhancedTest, retryAction, logStep } = require('../utils/testHelpers');

// Import only what you need
const { logStep } = require('../utils/testHelpers');
```

---

## workerReporter.js

### Purpose
A **custom console reporter** that displays enhanced worker information during test execution. Shows which parallel worker is running which test with color-coded status indicators.

**⚠️ Note:** This reporter is currently **disabled** in `playwright.config.ts` to avoid duplicate console output. It's kept for reference and can be re-enabled if needed.

---

### Class: `WorkerReporter`

#### Methods

#### 1. `onBegin(config, suite)`
**Purpose:** Displays a banner when test run starts with configuration details.

**Parameters:**
- `config`: Playwright configuration (workers, projects, etc.)
- `suite`: Test suite structure

**Console Output:**
```
================================================================================
Starting test run with 3 worker(s)
Project: chromium, firefox, webkit
================================================================================
```

**What it shows:**
- Visual separator (80 equal signs)
- Number of parallel workers configured
- List of browser projects being tested

---

#### 2. `onTestBegin(test)`
**Purpose:** Announces when a test starts on a specific worker.

**Parameters:**
- `test`: Test object with title and worker info

**Console Output:**
```
[Worker 0] 🚀 STARTING: Valid Login Test
[Worker 1] 🚀 STARTING: Register User Test
[Worker 2] 🚀 STARTING: Forgot Password Test
```

**What it shows:**
- Worker index (0, 1, 2, etc.)
- Rocket emoji 🚀 for visual clarity
- Full test name

---

#### 3. `onStdOut(chunk, test)` & `onStdErr(chunk, test)`
**Purpose:** Handle standard output/error streams.

**Current Implementation:**
- **Commented out** to prevent duplicate output
- By default, doesn't intercept console.log from tests
- The built-in list reporter handles this

**If uncommented:**
```javascript
onStdOut(chunk, test) {
  process.stdout.write(chunk); // Would duplicate test output
}
```

---

#### 4. `onTestEnd(test, result)`
**Purpose:** Displays test completion with status, duration, and color coding.

**Parameters:**
- `test`: Test object
- `result`: Result with status, duration, error

**Status Icons:**
- ✅ - Passed
- ❌ - Failed
- ⏭️ - Skipped
- ⏱️ - Timed Out
- ❓ - Unknown

**Status Colors:**
- **Green** (`\x1b[32m`) - Passed
- **Red** (`\x1b[31m`) - Failed
- **Yellow** (`\x1b[33m`) - Skipped
- **Magenta** (`\x1b[35m`) - Timed Out
- **White** (`\x1b[37m`) - Unknown

**Console Output Examples:**
```
[Worker 0] ✅ PASSED: Valid Login Test (3.45s)
[Worker 1] ❌ FAILED: Invalid Login Test (1.23s)
[Worker 1] 💥 Error: Email field is required
[Worker 2] ⏭️ SKIPPED: Admin Login Test (0.01s)
```

**Error Logging:**
- If test failed, displays error message
- Prefixed with 💥 explosion emoji
- Shows worker that encountered the error

---

#### 5. `onEnd(result)`
**Purpose:** Displays final summary when all tests complete.

**Parameters:**
- `result`: Final test run result with duration and status

**Console Output:**
```
================================================================================
Test run finished!
Duration: 45.67s
Status: PASSED
================================================================================
```

**What it shows:**
- Visual separator
- Total run duration (converted to seconds)
- Overall status (PASSED/FAILED)

---

### ANSI Color Codes Used

```javascript
'\x1b[32m' // Green
'\x1b[31m' // Red
'\x1b[33m' // Yellow
'\x1b[35m' // Magenta
'\x1b[37m' // White
'\x1b[0m'  // Reset (clear formatting)
```

These codes work in most terminals (PowerShell, bash, zsh).

---

### Module Export
```javascript
module.exports = WorkerReporter;
```

---

### Usage (Currently Disabled)

**To enable in `playwright.config.ts`:**
```typescript
reporter: [
  ['./utils/workerReporter.js'],
  ['list'], // Keep list reporter too
]
```

**Why it's disabled:**
- Caused duplicate console output
- The `logStep()` and `retryAction()` helpers already show worker indices
- Built-in `list` reporter provides sufficient default output

**When to re-enable:**
- If you want emojis and colors in test output
- If you disable the helper functions
- If you want a custom branded test output format

---

## Summary Comparison

| Feature | simpleHTMLReporter | testHelpers | workerReporter |
|---------|-------------------|-------------|----------------|
| **Type** | HTML file generator | Test utilities | Console reporter |
| **Purpose** | CSP-friendly report | Enhanced logging | Worker visibility |
| **When Used** | After tests finish | During test execution | During test execution |
| **Output** | HTML file | Console logs | Console logs |
| **Status** | ✅ Active | ✅ Active | ⚠️ Disabled |
| **Jenkins Compatible** | ✅ Yes (main purpose) | ✅ Yes | ✅ Yes |
| **Worker Info** | No (shows in results) | ✅ Yes ([W0] prefix) | ✅ Yes ([Worker 0]) |
| **Auto Screenshots** | No | ✅ Yes (enhancedTest) | No |
| **Retry Logic** | No | ✅ Yes (retryAction) | No |
| **Visual Icons** | ✓ ✗ ○ in HTML | → ✓ ✗ ↻ in console | 🚀 ✅ ❌ ⏭️ |

---

## Best Practices

### When to Use Each Utility

**Use `simpleHTMLReporter`:**
- Always (it's configured in playwright.config.ts)
- Viewing results in Jenkins
- Sharing reports with non-technical stakeholders
- Archiving test results

**Use `logStep()`:**
- For readable test structure
- Breaking down complex tests into logical steps
- When debugging test flow
- In all tests that need clear output

**Use `retryAction()`:**
- For flaky UI interactions (dropdowns, animations)
- Network-dependent actions
- Third-party integrations
- When element timing is unpredictable

**Use `enhancedTest()`:**
- When you want automatic failure screenshots
- For critical tests that need detailed failure info
- When debugging complex failures
- Alternative to manual screenshot calls

**Use `workerReporter`:**
- Only if you want emoji/color console output
- Only if you disable the default list reporter
- Not recommended currently (causes duplicates)

---

## File Locations

```
Playwright Training/
└── utils/
    ├── simpleHTMLReporter.js  ✅ Active
    ├── testHelpers.js         ✅ Active
    ├── workerReporter.js      ⚠️ Disabled
    └── UTILITIES_DOCUMENTATION.md  📚 This file
```

---

## Integration with CI/CD

### Jenkins Pipeline Usage

```groovy
stage('Run Tests') {
  steps {
    bat 'npx playwright test --project=chromium'
  }
}

post {
  always {
    // Publish the CSP-friendly HTML report
    publishHTML([
      reportDir: 'test-results',
      reportFiles: 'simple-report.html',
      reportName: 'Playwright Simple Report'
    ])
    
    // Archive screenshots on failure
    archiveArtifacts artifacts: 'test-results/**/*.png', 
                     allowEmptyArchive: true
  }
}
```

### What Gets Captured

1. **Simple HTML Report** (simpleHTMLReporter.js)
   - Location: `test-results/simple-report.html`
   - Viewable in Jenkins without CSP issues

2. **Failure Screenshots** (from enhancedTest or manual)
   - Location: `test-results/failure-*.png`
   - Attached to Playwright report
   - Archived as Jenkins artifacts

3. **Console Logs** (from logStep, retryAction)
   - Visible in Jenkins build console
   - Shows worker indices: `[W0]`, `[W1]`, `[W2]`
   - Shows step progress with icons

---

## Troubleshooting

### Issue: Duplicate Console Output
**Solution:** WorkerReporter is disabled. Don't re-enable it unless removing helper functions.

### Issue: Worker index shows "?"
**Solution:** Make sure you pass `testInfo` parameter:
```javascript
test('My test', async ({ page }, testInfo) => {
  await logStep('Step name', async () => {
    // code
  }, testInfo); // ← Don't forget this!
});
```

### Issue: Simple HTML report blank in Jenkins
**Solution:** Apply Jenkins CSP fix (see `JENKINS_CSP_FIX.md`)

### Issue: Screenshots not appearing
**Solution:** Make sure test failed (screenshots only on failure)

---

## Version History

- **v1.0** - Initial creation of simpleHTMLReporter
- **v1.1** - Added testHelpers (logStep, retryAction, enhancedTest)
- **v1.2** - Added workerReporter (later disabled)
- **v1.3** - Added worker index support to all helpers
- **v1.4** - Current version with documentation

---

*Last Updated: November 14, 2025*
