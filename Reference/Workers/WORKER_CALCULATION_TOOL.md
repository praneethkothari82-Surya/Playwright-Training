# Worker Calculation Tool Documentation

## Overview

`test-worker-calculation.js` is a diagnostic tool that calculates optimal Playwright worker allocation based on system resources. It helps developers understand how many parallel workers their machine can handle and demonstrates the same calculation logic used in Jenkins CI/CD.

---

## 📋 Table of Contents

- [Purpose](#purpose)
- [How It Works](#how-it-works)
- [Usage](#usage)
- [Output Explanation](#output-explanation)
- [Integration with Jenkins](#integration-with-jenkins)
- [Performance Impact](#performance-impact)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Purpose

### Why Use This Tool?

1. **Pre-CI Testing**: Understand local machine capabilities before pushing to Jenkins
2. **Performance Planning**: Estimate test execution time improvements
3. **Resource Validation**: Verify system has adequate CPU/RAM for parallel testing
4. **Team Onboarding**: Help new developers understand worker allocation
5. **CI/CD Debugging**: Compare local vs Jenkins worker calculations

### What It Does

✅ Detects CPU cores and memory  
✅ Calculates optimal worker count (75% of cores)  
✅ Displays performance comparison table  
✅ Provides recommendations based on resources  
✅ Shows command examples for running tests  

---

## ⚙️ How It Works

### Calculation Formula

```javascript
const cpuCores = os.cpus().length;
const workerCount = Math.floor(cpuCores * 0.75);
```

**Why 75%?**
- Leaves 25% CPU for OS, Jenkins agent, and background processes
- Prevents CPU thrashing and context switching
- Optimizes test execution speed without overloading system

### System Information Gathered

| Metric | Source | Purpose |
|--------|--------|---------|
| **CPU Model** | `os.cpus()[0].model` | Hardware identification |
| **CPU Cores** | `os.cpus().length` | Worker calculation base |
| **Total Memory** | `os.totalmem()` | RAM availability check |
| **Free Memory** | `os.freemem()` | Available RAM for tests |

---

## 🚀 Usage

### Running the Tool

**Method 1: Direct Execution**
```bash
node test-worker-calculation.js
```

**Method 2: NPM Script (add to package.json)**
```json
{
  "scripts": {
    "check-workers": "node test-worker-calculation.js"
  }
}
```

Then run:
```bash
npm run check-workers
```

### When to Run

- ✅ **Before starting development** - Understand your machine's capabilities
- ✅ **After upgrading hardware** - Verify improved worker allocation
- ✅ **Debugging slow tests** - Check if workers are optimally configured
- ✅ **Setting up new team member** - Help them configure local environment
- ✅ **CI/CD setup** - Compare local vs Jenkins agent resources

---

## 📊 Output Explanation

### Sample Output

```
╔════════════════════════════════════════════════════════════╗
║         System Resource & Worker Calculation              ║
╠════════════════════════════════════════════════════════════╣
║ CPU Model:           Intel(R) Core(TM) i3-4030U CPU      ║
║ CPU Cores Available: 4                                   ║
║ Total Memory:        11.89 GB                            ║
║ Free Memory:         6.31 GB                             ║
╠════════════════════════════════════════════════════════════╣
║ Formula:             cores × 0.75 = workers               ║
║ Calculation:         4 × 0.75 = 3.0                      ║
║ Workers Assigned:    3                                   ║
╠════════════════════════════════════════════════════════════╣
║ This machine can run 3 parallel Playwright workers      ║
╚════════════════════════════════════════════════════════════╝

Performance Comparison (100 tests example):
┌────────────┬──────────────┬──────────────┬─────────────────┐
│  Workers   │  Duration    │  CPU Usage   │  Efficiency     │
├────────────┼──────────────┼──────────────┼─────────────────┤
│     1      │   20 min     │     25%      │      ⭐         │
│     3      │   7 min      │     75%      │      ⭐⭐⭐         │
└────────────┴──────────────┴──────────────┴─────────────────┘

Recommendations:
✅ Good! Your system is well-suited for parallel testing.

To run Playwright with these workers:
  npx playwright test --workers=3

Or use environment variable:
  set PLAYWRIGHT_WORKERS=3 (Windows)
  export PLAYWRIGHT_WORKERS=3 (Linux/Mac)
```

### Breaking Down the Output

#### Section 1: System Resources

| Field | Description | Importance |
|-------|-------------|------------|
| **CPU Model** | Processor type and speed | Identifies hardware generation |
| **CPU Cores** | Number of logical processors | Direct input for worker calculation |
| **Total Memory** | Installed RAM | Determines max workers by memory |
| **Free Memory** | Currently available RAM | Shows if system has headroom |

#### Section 2: Worker Calculation

| Component | Example | Meaning |
|-----------|---------|---------|
| **Formula** | `cores × 0.75` | Standard calculation |
| **Calculation** | `4 × 0.75 = 3.0` | Actual math |
| **Workers Assigned** | `3` | Final worker count (integer) |

**Note**: `.toInteger()` rounds down to ensure we don't over-allocate workers.

#### Section 3: Performance Comparison

Shows estimated test execution time reduction:

| Workers | Duration | Explanation |
|---------|----------|-------------|
| **1** | 20 min | Sequential (baseline) |
| **3** | ~7 min | Parallel with 3 workers |
| **6** | ~4 min | High parallelization |

**Formula**: `Baseline Duration / Worker Count = Estimated Duration`

**CPU Usage**: Approximation based on `Workers × 25%`

**Efficiency Stars**: Visual indicator (⭐ to ⭐⭐⭐⭐⭐)

#### Section 4: Recommendations

| Worker Count | Message | Action |
|--------------|---------|--------|
| **6+** | Excellent! Heavy parallel testing | ✅ No changes needed |
| **3-5** | Good! Well-suited for parallel | ✅ Optimal configuration |
| **2** | Fair. Consider upgrading | ⚠️ May want more cores |
| **1** | Limited. Mostly sequential | ⚠️ Upgrade recommended |

#### Section 5: Usage Commands

**Direct Flag**:
```bash
npx playwright test --workers=3
```
- Highest priority override
- Applies to single test run

**Environment Variable (Windows)**:
```bash
set PLAYWRIGHT_WORKERS=3
npx playwright test
```
- Session-based configuration
- Persists for terminal session

**Environment Variable (Linux/Mac)**:
```bash
export PLAYWRIGHT_WORKERS=3
npx playwright test
```

---

## 🔗 Integration with Jenkins

### Comparison: Local vs Jenkins

| Aspect | Local (test-worker-calculation.js) | Jenkins (Jenkinsfile) |
|--------|-----------------------------------|----------------------|
| **Detection** | `os.cpus().length` (Node.js) | `Runtime.getRuntime().availableProcessors()` (Groovy) |
| **Calculation** | `Math.floor(cores * 0.75)` | `(cores * 0.75).toInteger()` |
| **Purpose** | Developer visibility | Automated CI/CD optimization |
| **Execution** | Manual: `node test-worker-calculation.js` | Automatic: Every Jenkins build |

### Jenkins Implementation

**Jenkinsfile Environment Block**:
```groovy
environment {
    PLAYWRIGHT_WORKERS = "${(Runtime.getRuntime().availableProcessors() * 0.75).toInteger()}"
}
```

**System Info Stage**:
```groovy
stage('System Info') {
    steps {
        script {
            def cpuCores = Runtime.getRuntime().availableProcessors()
            def maxMemory = Runtime.getRuntime().maxMemory() / (1024 * 1024 * 1024)
            
            echo "CPU Cores Available: ${cpuCores}"
            echo "Max Memory (GB): ${maxMemory.round(2)}"
            echo "Playwright Workers: ${PLAYWRIGHT_WORKERS}"
        }
    }
}
```

### Why Both Tools?

| Tool | Use Case |
|------|----------|
| **test-worker-calculation.js** | Local development, debugging, team education |
| **Jenkinsfile calculation** | Automated CI/CD, production test runs |

---

## 📈 Performance Impact

### Real-World Examples

#### Example 1: Small Project (50 tests)

| Configuration | Duration | Speedup |
|---------------|----------|---------|
| 1 worker (baseline) | 10 min | 1x |
| 2 workers | 5.5 min | 1.8x |
| 4 workers | 3 min | 3.3x |

#### Example 2: Medium Project (200 tests)

| Configuration | Duration | Speedup |
|---------------|----------|---------|
| 1 worker (baseline) | 40 min | 1x |
| 3 workers | 15 min | 2.7x |
| 6 workers | 8 min | 5x |

#### Example 3: Large Project (1000 tests)

| Configuration | Duration | Speedup |
|---------------|----------|---------|
| 1 worker (baseline) | 200 min | 1x |
| 4 workers | 55 min | 3.6x |
| 8 workers | 30 min | 6.7x |

### Diminishing Returns

**Sweet Spot**: 4-6 workers for most projects

| Workers | Efficiency Gain |
|---------|----------------|
| 1 → 2 | ~50% faster |
| 2 → 4 | ~25% faster |
| 4 → 8 | ~15% faster |
| 8 → 16 | ~5% faster |

**Why?** 
- Test suite overhead (setup/teardown)
- I/O bottlenecks (disk, network)
- Browser initialization time
- Shared resource contention

---

## 🔧 Customization

### Adjusting the Worker Percentage

**Current**: 75% of cores

**Options**:

#### Conservative (50%)
```javascript
const workerCount = Math.floor(cpuCores * 0.5);
```
**Use When:**
- Limited RAM (< 8GB)
- Running other heavy applications
- Shared development machines

#### Aggressive (100%)
```javascript
const workerCount = cpuCores;
```
**Use When:**
- Dedicated test machines
- Ample RAM (16GB+)
- SSD storage
- No other processes running

#### Custom Cap
```javascript
const workerCount = Math.min(Math.floor(cpuCores * 0.75), 6);
```
**Use When:**
- Want to limit max workers regardless of cores
- Prevent over-parallelization on high-core machines

### Adding Custom Checks

**Memory-Based Limiting**:
```javascript
const cpuBasedWorkers = Math.floor(cpuCores * 0.75);
const memoryGBPerWorker = 1; // 1GB per worker
const memoryBasedWorkers = Math.floor(totalMemoryGB / memoryGBPerWorker);
const workerCount = Math.min(cpuBasedWorkers, memoryBasedWorkers);
```

---

## 🐛 Troubleshooting

### Issue 1: Tool Shows High Worker Count But Tests Are Slow

**Symptoms:**
- Tool calculates 6+ workers
- Tests still take long time

**Possible Causes:**
1. **RAM Bottleneck**: Not enough memory per worker
2. **Disk I/O**: HDD struggling with parallel writes
3. **Network Latency**: Tests waiting on external APIs
4. **Test Design**: Tests not parallelizable (shared state)

**Solutions:**
```bash
# Try reducing workers
npx playwright test --workers=3

# Check memory usage during test run
# Windows Task Manager → Performance → Memory
# Ensure < 80% memory usage
```

### Issue 2: Different Results on Jenkins vs Local

**Symptoms:**
- Local: 4 cores, 3 workers
- Jenkins: Shows 16 cores, 12 workers
- Tests behave differently

**Explanation:**
- Jenkins agents often have more resources
- This is expected and beneficial

**Verification:**
```bash
# Run locally with Jenkins worker count
npx playwright test --workers=12

# If it fails, Jenkins agent has more resources
```

### Issue 3: Out of Memory Errors

**Symptoms:**
```
FATAL ERROR: Reached heap limit
```

**Solution:**
```javascript
// Reduce workers in the script
const workerCount = Math.min(Math.floor(cpuCores * 0.5), 3);
```

Or increase Node.js memory:
```bash
set NODE_OPTIONS=--max-old-space-size=4096
node test-worker-calculation.js
```

### Issue 4: Tool Not Found

**Symptoms:**
```
node: command not found
```

**Solutions:**
1. Install Node.js: https://nodejs.org/
2. Verify installation: `node --version`
3. Restart terminal

---

## 📝 Best Practices

### Development Workflow

1. **Initial Setup**:
   ```bash
   node test-worker-calculation.js
   # Note the recommended worker count
   ```

2. **Local Testing**:
   ```bash
   npx playwright test --workers=3 --project=chromium
   # Use calculated workers for speed
   ```

3. **Debugging**:
   ```bash
   npx playwright test --workers=1 --headed --debug
   # Use 1 worker to isolate issues
   ```

4. **CI/CD Push**:
   - Jenkins auto-detects and uses optimal workers
   - Check build logs for System Info

### Team Guidelines

✅ **Do:**
- Run calculation tool after hardware upgrades
- Document your machine's worker count in team wiki
- Use calculated workers for local test runs
- Compare with Jenkins agent specs

❌ **Don't:**
- Hardcode worker count in playwright.config.ts
- Exceed recommended workers
- Ignore memory constraints
- Run max workers on shared machines

---

## 🔄 Version History

- **v1.0** (Nov 2025) - Initial release
  - CPU core detection
  - 75% worker calculation
  - Performance comparison table
  - Recommendations engine

---

## 📚 Related Documentation

- **JENKINS_WORKERS.md** - Jenkins worker configuration guide
- **playwright.config.ts** - Playwright configuration
- **Jenkinsfile** - CI/CD pipeline with dynamic workers
- **DATA_READERS.md** - Data-driven testing with workers

---

## 💡 Quick Reference

### Commands

| Command | Purpose |
|---------|---------|
| `node test-worker-calculation.js` | Run calculation tool |
| `npx playwright test --workers=3` | Run tests with 3 workers |
| `npx playwright test --workers=1` | Sequential execution |
| `npx playwright test --workers=100%` | Use all CPU cores |

### Environment Variables

| Platform | Command |
|----------|---------|
| **Windows** | `set PLAYWRIGHT_WORKERS=3` |
| **Linux/Mac** | `export PLAYWRIGHT_WORKERS=3` |
| **PowerShell** | `$env:PLAYWRIGHT_WORKERS=3` |

### Key Concepts

| Concept | Value | Meaning |
|---------|-------|---------|
| **Worker** | Parallel execution unit | Each runs tests independently |
| **CPU Core** | Physical/logical processor | Determines max workers |
| **75% Rule** | cores × 0.75 | Optimal worker allocation |
| **Efficiency** | Tests/minute | Speed improvement metric |

---

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review **JENKINS_WORKERS.md**
3. Check Playwright docs: https://playwright.dev/docs/test-parallel
4. Contact DevOps team for Jenkins agent specs

---

*Last Updated: November 14, 2025*
