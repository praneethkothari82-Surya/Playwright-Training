# Playwright Testing Framework

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run tests
npx playwright test

# Run tests with UI
npx playwright test --ui
```

---

## 📚 Documentation

All comprehensive documentation is organized in the **`Reference/`** folder:

```
Reference/
├── Workers/          # Parallel execution & worker configuration
├── Utilities/        # Test helpers, data readers, reporters
├── Jenkins/          # CI/CD pipeline setup
└── README.md         # Documentation index
```

### Quick Links

| Topic | Documentation |
|-------|--------------|
| **Worker Calculation** | [`Reference/Workers/test-worker-calculation.js`](Reference/Workers/test-worker-calculation.js) |
| **Worker Configuration** | [`Reference/Workers/WORKER_DOCS_INDEX.md`](Reference/Workers/WORKER_DOCS_INDEX.md) |
| **Test Utilities** | [`Reference/Utilities/UTILITIES_DOCUMENTATION.md`](Reference/Utilities/UTILITIES_DOCUMENTATION.md) |
| **Data Readers (CSV/Excel)** | [`Reference/Utilities/DATA_READERS.md`](Reference/Utilities/DATA_READERS.md) |
| **Jenkins Setup** | [`Reference/Jenkins/JENKINS_WORKERS.md`](Reference/Jenkins/JENKINS_WORKERS.md) |

📖 **[View Full Documentation Index →](Reference/README.md)**

---

## 🧪 Project Structure

```
├── pages/                    # Page Object Models
│   ├── home.page.js
│   ├── login.page.js
│   └── register.page.js
├── tests/                    # Test files
│   ├── login.spec.js
│   ├── parallel.spec.js
│   └── data-driven.spec.js
├── utils/                    # Utility functions
│   ├── testHelpers.js       # Test helper functions
│   ├── excelReader.js       # Excel data reader
│   ├── csvReader.js         # CSV data reader
│   └── simpleHTMLReporter.js
├── testdata/                # Test data files
│   └── users.csv
├── Reference/               # 📚 All Documentation
│   ├── Workers/
│   ├── Utilities/
│   ├── Jenkins/
│   └── README.md
├── playwright.config.ts     # Playwright configuration
├── Jenkinsfile             # CI/CD pipeline
└── package.json            # Dependencies
```

---

## ⚡ Common Commands

### Run Tests

```bash
# All tests
npx playwright test

# Specific test file
npx playwright test login.spec.js

# Tests with specific tag
npx playwright test --grep @SmokeTest

# Specific browser
npx playwright test --project=chromium

# With workers (parallel execution)
npx playwright test --workers=3

# Headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

### Check System Capabilities

```bash
# Calculate optimal workers for your machine
node Reference/Workers/test-worker-calculation.js
```

### Generate Reports

```bash
# View HTML report
npx playwright show-report

# Generate trace
npx playwright test --trace on
npx playwright show-trace trace.zip
```

---

## 🔧 Configuration

### Worker Configuration

**Local**: Auto-detect (50% of CPU cores)
```typescript
// playwright.config.ts
workers: process.env.CI ? 3 : undefined
```

**Jenkins**: Dynamic (75% of CPU cores)
```groovy
// Jenkinsfile
PLAYWRIGHT_WORKERS = "${(Runtime.getRuntime().availableProcessors() * 0.75).toInteger()}"
```

**Override**:
```bash
npx playwright test --workers=4
# or
set PLAYWRIGHT_WORKERS=4
npx playwright test
```

---

## 📊 Features

✅ **Page Object Model** - Maintainable test structure  
✅ **Parallel Execution** - Faster test runs with workers  
✅ **Data-Driven Testing** - CSV & Excel data readers  
✅ **Test Helpers** - Reusable utility functions  
✅ **Custom Reporters** - HTML & worker tracking  
✅ **CI/CD Integration** - Jenkins pipeline with dynamic workers  
✅ **Comprehensive Documentation** - Guides for all features  

---

## 🎯 Test Examples

### Login Test
```javascript
const { test } = require('@playwright/test');
const LoginPage = require('./pages/login.page');

test('User login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('user@test.com', 'password123');
});
```

### Data-Driven Test (CSV)
```javascript
const { readCSV } = require('./utils/csvReader');

const users = await readCSV('testdata/users.csv');
users.forEach(user => {
    test(`Register ${user.email}`, async ({ page }) => {
        // Test logic
    });
});
```

### Parallel Test
```javascript
test.describe.configure({ mode: 'parallel' });

test.describe('Parallel Tests', () => {
    // All tests run in parallel
});
```

---

## 📈 Performance

| Configuration | 100 Tests | Improvement |
|--------------|-----------|-------------|
| 1 Worker | 20 min | Baseline |
| 3 Workers | 7 min | **65% faster** |
| 6 Workers | 4 min | **80% faster** |

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Configure Python environment (if needed)
# Playwright handles browser installation automatically

# Run specific test in debug mode
npx playwright test login.spec.js --debug

# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace test-results/trace.zip
```

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `@playwright/test` | Test framework |
| `xlsx` | Excel file reading (fast) |
| `exceljs` | Excel file writing (rich formatting) |
| `csv-parse` | CSV file parsing |

---

## 🔗 Resources

- **Documentation**: See [`Reference/`](Reference/) folder
- **Playwright Docs**: https://playwright.dev/docs/intro
- **API Reference**: https://playwright.dev/docs/api/class-playwright

---

## 👥 Team

- **DevOps**: Jenkins CI/CD setup
- **QA**: Test development and maintenance

---

*For detailed documentation, see [Reference/README.md](Reference/README.md)*
