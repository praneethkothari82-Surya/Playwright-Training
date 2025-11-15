# Thread-Safe Parallel Testing - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install (Already Done!)
Your project already has all dependencies installed.

### Step 2: Copy Example Test

Create a new test file or use the provided `tests/parallel-safe.spec.js`:

```javascript
const { test } = require('@playwright/test');
const { TestDataManager } = require('../utils/testDataManager');
const LoginPage = require('../pages/login.page');
const RegisterPage = require('../pages/register.page');

let dataManager;

// Load data once
test.beforeAll(async () => {
    dataManager = new TestDataManager('testdata/users.csv', {
        dataPerWorker: 10
    });
    await dataManager.loadData();
});

// Enable parallel mode
test.describe.configure({ mode: 'parallel' });

// Create your tests
for (let i = 0; i < 3; i++) {
    test(`Register User ${i + 1}`, async ({ page }, testInfo) => {
        // Get unique data for this worker
        const user = dataManager.getUniqueData(testInfo.parallelIndex, i);
        
        if (!user) {
            test.skip();
            return;
        }
        
        // Use the data
        const registerPage = new RegisterPage(page);
        await page.goto('/register');
        await registerPage.register(
            user.firstName,
            user.lastName,
            user.email,
            user.password,
            user.gender
        );
    });
}
```

### Step 3: Run Tests

```bash
# Run with 3 workers (default based on CPU)
npx playwright test tests/parallel-safe.spec.js

# Run with specific worker count
npx playwright test tests/parallel-safe.spec.js --workers=3

# Watch the worker logs
npx playwright test tests/parallel-safe.spec.js --workers=3 --reporter=line
```

### Step 4: Verify Success

Look for output like:
```
[W0] ✓ Register User 1 (using john0@test.com)
[W1] ✓ Register User 1 (using john1@test.com)
[W2] ✓ Register User 1 (using john2@test.com)
[W0] ✓ Register User 2 (using jane0@test.com)
[W1] ✓ Register User 2 (using jane1@test.com)
[W2] ✓ Register User 2 (using jane2@test.com)

✅ 6 passed (no race conditions!)
```

---

## 📝 Common Patterns

### Pattern 1: Single User Per Test

```javascript
test('My test', async ({ page }, testInfo) => {
    const user = dataManager.getUniqueData(testInfo.parallelIndex, 0);
    if (!user) {
        test.skip();
        return;
    }
    // Use user...
});
```

### Pattern 2: Multiple Users Per Test

```javascript
test('Bulk test', async ({ page }, testInfo) => {
    const users = dataManager.getMultipleData(testInfo.parallelIndex, 3);
    if (users.length < 3) {
        test.skip();
        return;
    }
    for (const user of users) {
        // Use user...
    }
});
```

### Pattern 3: Filtered Data

```javascript
test('Active users only', async ({ page }, testInfo) => {
    const activeUsers = dataManager.getFilteredData({ status: 'active' });
    const index = testInfo.parallelIndex;
    const user = activeUsers[index];
    if (!user) {
        test.skip();
        return;
    }
    // Use user...
});
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ WRONG: Hardcoded Worker Index
```javascript
const user = dataManager.getUniqueData(0, 0);  // Always uses worker 0!
```

### ✅ CORRECT: Dynamic Worker Index
```javascript
const user = dataManager.getUniqueData(testInfo.parallelIndex, 0);
```

---

### ❌ WRONG: No Validation
```javascript
const user = dataManager.getUniqueData(testInfo.parallelIndex, 0);
await page.fill('#email', user.email);  // Crashes if user is null!
```

### ✅ CORRECT: With Validation
```javascript
const user = dataManager.getUniqueData(testInfo.parallelIndex, 0);
if (!user) {
    test.skip();
    return;
}
await page.fill('#email', user.email);
```

---

## 🔧 Configuration Options

### TestDataManager Options

```javascript
const dataManager = new TestDataManager('path/to/file.csv', {
    dataPerWorker: 10,      // How many records each worker gets (default: 10)
    sheetName: 'Users',     // For Excel files only
    dataType: 'csv'         // 'csv' or 'excel' (auto-detected)
});
```

### Playwright Workers Configuration

**playwright.config.ts:**
```javascript
export default defineConfig({
    workers: process.env.CI ? 3 : undefined,  // 3 workers in CI, auto-detect locally
});
```

**Command line:**
```bash
npx playwright test --workers=3
npx playwright test --workers=50%  # Use 50% of CPU cores
```

---

## 📊 Monitoring & Debugging

### Print Statistics

```javascript
test.afterAll(() => {
    dataManager.printStats();
});
```

Output:
```
📊 Test Data Usage Statistics:
   Total Records: 50
   Used Records: 15
   Available Records: 35
   Usage: 30.00%
```

### Debug Logs

```javascript
test('My test', async ({ page }, testInfo) => {
    const user = dataManager.getUniqueData(testInfo.parallelIndex, 0);
    
    console.log(`[W${testInfo.parallelIndex}] Using: ${user.email}`);
    console.log(`[W${testInfo.parallelIndex}] Data index: ${user._dataIndex}`);
    
    // ... test code ...
});
```

---

## 🎯 Troubleshooting

### Problem: "No data available"

**Cause:** Not enough test data for number of workers.

**Solution:** Add more test data or reduce workers:
```bash
npx playwright test --workers=2
```

### Problem: Tests still have race conditions

**Cause:** Not using `testInfo.parallelIndex`.

**Solution:** Check your code uses:
```javascript
const user = dataManager.getUniqueData(testInfo.parallelIndex, offset);
```

### Problem: Some tests skip unexpectedly

**Cause:** Test offset exceeds `dataPerWorker`.

**Solution:** Increase `dataPerWorker`:
```javascript
const dataManager = new TestDataManager('file.csv', {
    dataPerWorker: 20  // Increased from 10
});
```

---

## 📚 Full Documentation

For detailed explanations and advanced topics, see:
- **[PARALLEL_TESTING_GUIDE.md](./PARALLEL_TESTING_GUIDE.md)** - Complete beginner's guide
- **[utils/testDataManager.js](../utils/testDataManager.js)** - Full API documentation
- **[tests/parallel-safe.spec.js](../tests/parallel-safe.spec.js)** - Working examples

---

## ✅ Checklist

Before running parallel tests:

- [ ] TestDataManager initialized in `beforeAll()`
- [ ] Data loaded with `await dataManager.loadData()`
- [ ] Parallel mode enabled: `test.describe.configure({ mode: 'parallel' })`
- [ ] Using `testInfo.parallelIndex` for worker index
- [ ] Validating data with `if (!user) test.skip()`
- [ ] Enough test data for all workers (workers × dataPerWorker)

---

## 🎉 Success Criteria

Your tests are working correctly when:

✅ All tests pass without race condition errors  
✅ Each worker uses different data (check logs)  
✅ No "duplicate email" or "user already exists" errors  
✅ Tests complete faster than sequential execution  
✅ Statistics show reasonable data usage  

---

**Need help?** See the full guide: [PARALLEL_TESTING_GUIDE.md](./PARALLEL_TESTING_GUIDE.md)
