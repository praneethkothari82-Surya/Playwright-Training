# Playwright Testing Framework - Reference Documentation

## 📚 Overview

This folder contains comprehensive reference documentation for the Playwright testing framework, including configuration guides, utility documentation, and CI/CD setup instructions.

---

## 📁 Folder Structure

```
Reference/
├── Workers/           # Parallel execution and worker configuration
├── Utilities/         # Helper functions and data readers
├── Jenkins/          # CI/CD pipeline configuration
└── README.md         # This file
```

---

## 🗂️ Documentation Categories

### 1️⃣ Workers (Parallel Execution)

**Location**: `Reference/Workers/`

| File | Description | Size |
|------|-------------|------|
| **WORKER_DOCS_INDEX.md** | Master index for all worker documentation | 9.28 KB |
| **WORKER_CALCULATION_TOOL.md** | Complete guide to worker calculation tool | 15.17 KB |
| **test-worker-calculation.js** | Diagnostic tool for calculating optimal workers | 5.08 KB |

**Quick Start**:
```bash
# Run worker calculation tool
node Reference/Workers/test-worker-calculation.js

# Run tests with optimal workers
npx playwright test --workers=3
```

**Key Concepts**:
- Worker allocation formula: `Workers = Math.floor(CPU Cores × 0.75)`
- Performance impact: 3 workers can reduce test time by 60-70%
- Dynamic allocation in Jenkins CI/CD

---

### 2️⃣ Utilities (Helper Functions & Data Readers)

**Location**: `Reference/Utilities/`

| File | Description | Size |
|------|-------------|------|
| **UTILITIES_DOCUMENTATION.md** | Test helpers, reporters, and utility functions | 19.63 KB |
| **DATA_READERS.md** | Excel and CSV data reader utilities | 14.81 KB |

**Key Utilities**:
- **testHelpers.js**: `logStep()`, `retryAction()`, `enhancedTest()`
- **excelReader.js**: Read data from Excel files (xlsx library)
- **csvReader.js**: Read data from CSV files (csv-parse library)
- **excelWriter.js**: Write test results to Excel (exceljs library)
- **simpleHTMLReporter.js**: CSP-friendly HTML reports
- **workerReporter.js**: Worker index tracking in test output

---

### 3️⃣ Jenkins (CI/CD Configuration)

**Location**: `Reference/Jenkins/`

| File | Description | Size |
|------|-------------|------|
| **JENKINS_WORKERS.md** | Jenkins worker configuration and optimization | 9.79 KB |
| **JENKINS_CSP_FIX.md** | Content Security Policy configuration for HTML reports | 4.56 KB |

**Key Features**:
- Dynamic worker allocation based on agent CPU cores
- System Info stage displaying resources
- HTML report configuration for Jenkins
- Performance optimization strategies

---

## 🚀 Quick Reference

### For Developers (Local Development)

```bash
# 1. Check your machine's worker capacity
node Reference/Workers/test-worker-calculation.js

# 2. Run tests with optimal workers
npx playwright test --workers=3 --project=chromium

# 3. Debug with single worker
npx playwright test --workers=1 --headed --debug

# 4. Use data readers for data-driven tests
# See Reference/Utilities/DATA_READERS.md
```

### For CI/CD (Jenkins)

```groovy
// Dynamic worker allocation (already configured in Jenkinsfile)
environment {
    PLAYWRIGHT_WORKERS = "${(Runtime.getRuntime().availableProcessors() * 0.75).toInteger()}"
}

// Check System Info stage in build logs for:
// - CPU cores available
// - Memory (GB)
// - Workers assigned
```

---

## 📖 Documentation Index

### Getting Started
1. **New to parallel testing?** → Start with `Workers/WORKER_DOCS_INDEX.md`
2. **Setting up utilities?** → Read `Utilities/UTILITIES_DOCUMENTATION.md`
3. **Configuring Jenkins?** → Check `Jenkins/JENKINS_WORKERS.md`

### Common Tasks

| Task | Documentation |
|------|---------------|
| Calculate optimal workers for my machine | `Workers/test-worker-calculation.js` |
| Understand worker allocation | `Workers/WORKER_CALCULATION_TOOL.md` |
| Use test helpers (logStep, retryAction) | `Utilities/UTILITIES_DOCUMENTATION.md` |
| Read data from Excel/CSV | `Utilities/DATA_READERS.md` |
| Configure Jenkins workers | `Jenkins/JENKINS_WORKERS.md` |
| Fix Jenkins HTML reports | `Jenkins/JENKINS_CSP_FIX.md` |

---

## 🎯 Performance Impact

### Worker Parallelization

| Test Suite | 1 Worker | 3 Workers | Improvement |
|------------|----------|-----------|-------------|
| 50 tests | 10 min | 3.5 min | **65% faster** |
| 100 tests | 20 min | 7 min | **65% faster** |
| 200 tests | 40 min | 15 min | **62% faster** |

### Data-Driven Testing

Using CSV/Excel readers with parallel workers:
- Load test data once (beforeAll)
- Create individual tests for each data row
- Each test runs in separate worker
- Maximum parallelization achieved

**Example**: See `tests/parallel.spec.js`

---

## 🛠️ Tools & Scripts

### test-worker-calculation.js

**Location**: `Reference/Workers/test-worker-calculation.js`

**Purpose**: Calculate optimal Playwright workers for your system

**Usage**:
```bash
node Reference/Workers/test-worker-calculation.js
```

**Output**:
- CPU cores and memory information
- Calculated worker count (75% of cores)
- Performance comparison table
- Recommendations
- Command examples

**Documentation**: `Reference/Workers/WORKER_CALCULATION_TOOL.md`

---

## 📊 File Statistics

| Category | Files | Total Size |
|----------|-------|------------|
| **Workers** | 3 files | 29.53 KB |
| **Utilities** | 2 files | 34.44 KB |
| **Jenkins** | 2 files | 14.35 KB |
| **Total** | 7 files | 78.32 KB |

---

## 🔗 Related Files (Project Root)

### Configuration
- `playwright.config.ts` - Playwright test configuration
- `Jenkinsfile` - Jenkins CI/CD pipeline
- `package.json` - Dependencies and scripts

### Utilities (Source Code)
- `utils/testHelpers.js` - Test helper functions
- `utils/excelReader.js` - Excel data reader
- `utils/csvReader.js` - CSV data reader
- `utils/excelWriter.js` - Excel file writer
- `utils/simpleHTMLReporter.js` - HTML reporter
- `utils/workerReporter.js` - Worker tracking reporter

### Page Objects
- `pages/home.page.js` - Home page object
- `pages/login.page.js` - Login page object
- `pages/register.page.js` - Register page object

### Tests
- `tests/login.spec.js` - Login tests
- `tests/parallel.spec.js` - Parallel execution examples
- `tests/data-driven.spec.js` - Data-driven test examples

---

## 📞 Support

### Need Help?

1. **Worker Configuration**: Check `Workers/WORKER_DOCS_INDEX.md`
2. **Utilities Usage**: Read `Utilities/UTILITIES_DOCUMENTATION.md`
3. **Jenkins Setup**: Review `Jenkins/JENKINS_WORKERS.md`
4. **Troubleshooting**: Each documentation file has a troubleshooting section

### Quick Links

- [Playwright Official Docs](https://playwright.dev/docs/intro)
- [Playwright Test Parallelization](https://playwright.dev/docs/test-parallel)
- [Node.js OS Module](https://nodejs.org/api/os.html)

---

## 🔄 Updates

- **Nov 14, 2025** - Initial documentation structure
- **Nov 14, 2025** - Added worker calculation tool and comprehensive guides
- **Nov 14, 2025** - Organized into Reference folder structure

---

## 📝 Contributing

To update documentation:
1. Edit the relevant file in the appropriate subfolder
2. Update this README if adding new files
3. Test any code examples or commands
4. Commit with clear description

---

*Maintained by: DevOps & QA Team*  
*Last Updated: November 14, 2025*
