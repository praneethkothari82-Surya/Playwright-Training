# Playwright Worker Documentation Index

## 📚 Overview

This directory contains comprehensive documentation for understanding and optimizing Playwright parallel test execution using workers. Workers are independent processes that run tests simultaneously, dramatically reducing test execution time.

---

## 🗂️ Documentation Files

### 1. **WORKER_CALCULATION_TOOL.md**
**Purpose**: Complete guide for the `test-worker-calculation.js` diagnostic tool  
**Use When**: Setting up local environment, debugging performance, team onboarding  
**Key Topics**:
- How the calculation tool works
- Output interpretation
- Performance impact analysis
- Troubleshooting guide
- Best practices

📄 [Read Full Documentation](./WORKER_CALCULATION_TOOL.md)

---

### 2. **JENKINS_WORKERS.md**
**Purpose**: Jenkins CI/CD worker configuration and optimization  
**Use When**: Setting up CI/CD, optimizing Jenkins pipelines, scaling test execution  
**Key Topics**:
- Dynamic worker allocation in Jenkins
- Resource requirements (CPU, RAM)
- System Info stage explanation
- Performance comparison tables
- Manual worker override methods

📄 [Read Full Documentation](./JENKINS_WORKERS.md)

---

### 3. **test-worker-calculation.js**
**Purpose**: Executable diagnostic tool for local worker calculation  
**Use When**: Before committing code, after hardware upgrades, debugging slow tests  
**Run Command**:
```bash
node test-worker-calculation.js
```

**Output Example**:
```
CPU Cores Available: 4
Workers Assigned: 3
Performance: 20 min → 7 min (with 3 workers)
```

---

## 🎯 Quick Start Guide

### For Developers (Local Testing)

1. **Check your machine's capabilities**:
   ```bash
   node test-worker-calculation.js
   ```

2. **Run tests with recommended workers**:
   ```bash
   npx playwright test --workers=3
   ```

3. **For debugging, use 1 worker**:
   ```bash
   npx playwright test --workers=1 --headed --debug
   ```

### For CI/CD (Jenkins)

1. **Review Jenkinsfile configuration**:
   - Dynamic worker calculation is automatic
   - Check `environment` block for `PLAYWRIGHT_WORKERS`

2. **View system info in build logs**:
   - System Info stage shows CPU cores and worker count

3. **Override if needed**:
   - Set `PLAYWRIGHT_WORKERS` environment variable in Jenkins job

---

## 📊 Worker Allocation Strategy

### The 75% Rule

```
Workers = Math.floor(CPU Cores × 0.75)
```

| CPU Cores | Workers Allocated | Reasoning |
|-----------|-------------------|-----------|
| 2 | 1 | Minimal parallelization |
| 4 | 3 | Good balance |
| 8 | 6 | Optimal for most CI agents |
| 12 | 9 | High performance |
| 16 | 12 | Maximum efficiency |

**Why 75%?**
- **75%** → Playwright workers (test execution)
- **15%** → Jenkins/system overhead
- **10%** → Operating system, background tasks

This prevents CPU thrashing and maintains system stability.

---

## 🚀 Performance Impact

### Example: 100 Tests

| Workers | Duration | CPU Usage | Speedup |
|---------|----------|-----------|---------|
| 1 | 20 min | 25% | 1x (baseline) |
| 3 | 7 min | 75% | 2.9x faster |
| 6 | 4 min | 95% | 5x faster |

### Real-World Scenarios

#### Scenario 1: Small Project (50 tests)
- **1 worker**: 10 minutes
- **3 workers**: 3.5 minutes ⚡ **65% faster**

#### Scenario 2: Medium Project (200 tests)
- **1 worker**: 40 minutes
- **6 workers**: 8 minutes ⚡ **80% faster**

#### Scenario 3: Large Project (1000 tests)
- **1 worker**: 200 minutes
- **8 workers**: 30 minutes ⚡ **85% faster**

---

## 🔧 Configuration Files

### playwright.config.ts
```typescript
export default defineConfig({
  workers: process.env.CI ? 3 : undefined,
  // CI: 3 workers (default)
  // Local: Auto-detect (50% of cores)
});
```

### Jenkinsfile
```groovy
environment {
    PLAYWRIGHT_WORKERS = "${(Runtime.getRuntime().availableProcessors() * 0.75).toInteger()}"
}
```

### Override Priority
1. `--workers=X` CLI flag (highest)
2. `PLAYWRIGHT_WORKERS` environment variable
3. `playwright.config.ts` setting
4. Auto-detect (default)

---

## 🎓 Common Use Cases

### Use Case 1: Local Development
**Goal**: Fast feedback while developing tests

**Solution**:
```bash
# Check optimal workers
node test-worker-calculation.js

# Run with recommended workers
npx playwright test --workers=3 --project=chromium
```

### Use Case 2: Debugging Failing Tests
**Goal**: Isolate test failures without parallel interference

**Solution**:
```bash
# Run sequentially with UI
npx playwright test failing-test.spec.js --workers=1 --headed --debug
```

### Use Case 3: CI/CD Pipeline
**Goal**: Maximize speed in Jenkins without overloading agent

**Solution**:
- Use dynamic worker calculation (already configured)
- Monitor System Info stage in build logs
- Adjust if agent shows resource constraints

### Use Case 4: Data-Driven Tests
**Goal**: Run multiple test cases in parallel

**Solution**:
```javascript
// tests/parallel.spec.js
test.describe.configure({ mode: 'parallel' });

// Each test runs in separate worker
for (let i = 0; i < users.length; i++) {
    test(`Test User ${i + 1}`, async ({ page }) => {
        // Test logic
    });
}
```

---

## 🐛 Troubleshooting

### Problem: Tests slower than expected

**Diagnosis**:
```bash
node test-worker-calculation.js
# Check if workers match recommendation
```

**Solutions**:
- Reduce workers if CPU/RAM constrained
- Check for disk I/O bottleneck (use SSD)
- Verify tests are parallelizable (no shared state)

### Problem: Out of memory errors

**Symptoms**:
```
FATAL ERROR: JavaScript heap out of memory
```

**Solutions**:
1. Reduce workers:
   ```bash
   npx playwright test --workers=2
   ```

2. Increase Node.js memory:
   ```bash
   set NODE_OPTIONS=--max-old-space-size=4096
   npx playwright test
   ```

### Problem: Jenkins shows different worker count

**Expected Behavior**: Jenkins agents often have more cores than local machines

**Verification**:
- Check System Info stage in Jenkins build logs
- Compare: Local cores vs Jenkins agent cores

---

## 📋 Best Practices

### ✅ Do's

✅ Run `test-worker-calculation.js` after hardware upgrades  
✅ Use recommended workers for local development  
✅ Use `--workers=1` for debugging  
✅ Monitor Jenkins System Info logs  
✅ Scale workers based on test suite size  
✅ Document team member machine specs  

### ❌ Don'ts

❌ Don't hardcode workers in config files  
❌ Don't exceed 100% of CPU cores  
❌ Don't ignore memory constraints  
❌ Don't run max workers on shared machines  
❌ Don't assume same workers for local and CI  

---

## 📖 Learning Path

### Beginner
1. Read **WORKER_CALCULATION_TOOL.md** - Sections: Purpose, Usage, Output Explanation
2. Run `node test-worker-calculation.js`
3. Understand the 75% rule
4. Run tests with recommended workers

### Intermediate
1. Read **JENKINS_WORKERS.md** - Sections: Jenkins Configuration, Performance Comparison
2. Review `Jenkinsfile` environment block
3. Experiment with different worker counts locally
4. Understand override methods

### Advanced
1. Read full **WORKER_CALCULATION_TOOL.md** - Customization section
2. Implement custom worker caps based on memory
3. Optimize test suite for parallelization
4. Create custom worker allocation strategies

---

## 🔗 Related Resources

### Internal Documentation
- `utils/UTILITIES_DOCUMENTATION.md` - Test helpers and utilities
- `utils/DATA_READERS.md` - Excel/CSV data readers
- `JENKINS_CSP_FIX.md` - Jenkins HTML report configuration

### External Links
- [Playwright Parallelization](https://playwright.dev/docs/test-parallel)
- [Playwright Workers](https://playwright.dev/docs/test-parallel#worker-processes)
- [Node.js OS Module](https://nodejs.org/api/os.html#oscpus)

---

## 📞 Support

### Questions?
1. Check this index for relevant documentation
2. Review specific documentation file
3. Run diagnostic tool: `node test-worker-calculation.js`
4. Contact DevOps team for Jenkins agent issues

### Contributing
To update worker-related documentation:
1. Edit relevant `.md` file
2. Update this index if adding new files
3. Test changes with actual tool/configuration
4. Commit with clear description

---

## 📝 Summary

| Topic | File | Purpose |
|-------|------|---------|
| **Local Diagnostics** | test-worker-calculation.js | Calculate optimal workers for your machine |
| **Tool Documentation** | WORKER_CALCULATION_TOOL.md | Complete guide to diagnostic tool |
| **Jenkins CI/CD** | JENKINS_WORKERS.md | Jenkins worker configuration guide |
| **Configuration** | Jenkinsfile | Actual Jenkins pipeline implementation |
| **Playwright Config** | playwright.config.ts | Test framework configuration |

---

## 🎯 Quick Commands

```bash
# Check system capabilities
node test-worker-calculation.js

# Run tests with optimal workers
npx playwright test --workers=3

# Debug with single worker
npx playwright test --workers=1 --headed --debug

# Run specific test with max workers
npx playwright test parallel.spec.js --workers=6

# Override worker count
set PLAYWRIGHT_WORKERS=4 && npx playwright test
```

---

*Last Updated: November 14, 2025*  
*Maintained by: DevOps & QA Team*
