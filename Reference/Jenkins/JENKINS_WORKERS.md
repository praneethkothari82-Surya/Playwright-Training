# Jenkins Worker Configuration Guide

## Overview

This document explains how Playwright workers are configured and optimized in Jenkins CI/CD pipelines, including dynamic worker allocation based on available system resources.

---

## 📊 Understanding Workers

### What are Workers?

**Workers** are parallel execution units that Playwright uses to run tests simultaneously. Each worker:
- Runs in a separate Node.js process
- Has its own browser instance
- Executes tests independently
- Uses system CPU and RAM resources

### Benefits of Multiple Workers

| Workers | Test Duration | Resource Usage |
|---------|--------------|----------------|
| 1 worker | 100% (baseline) | Low |
| 2 workers | ~50% | Medium |
| 4 workers | ~25% | High |
| 8 workers | ~12.5% | Very High |

**Example:** 100 tests taking 10 minutes with 1 worker → ~2.5 minutes with 4 workers

---

## 🖥️ Jenkins Agent Resources

### Factors Determining Worker Count

#### 1. CPU Cores
- **Recommendation**: 1 worker per CPU core (or 75% of cores)
- **Why**: Each worker needs CPU time for browser automation
- **Over-allocation**: Causes context switching, slower performance

#### 2. Memory (RAM)
- **Per Worker**: ~500MB - 1GB RAM
- **Formula**: `(Available RAM - 2GB for OS) / 1GB = Max Workers`
- **Example**: 8GB RAM → 6GB available → 6 max workers

#### 3. Disk I/O
- Tests write screenshots, videos, traces
- SSD recommended for 4+ workers
- HDD may bottleneck with many workers

---

## 🔧 Jenkins Configuration

### Current Implementation

**File**: `Jenkinsfile`

```groovy
environment {
    // Dynamically set workers based on available CPU cores
    // Use 75% of available cores for optimal performance
    PLAYWRIGHT_WORKERS = "${(Runtime.getRuntime().availableProcessors() * 0.75).toInteger()}"
}
```

### Why 75% of CPU Cores?

| CPU Usage | Purpose |
|-----------|---------|
| **75%** | Playwright test workers |
| **15%** | Jenkins agent overhead |
| **10%** | Operating system, background tasks |

This prevents:
- ❌ CPU thrashing (too many workers)
- ❌ Out of memory errors
- ❌ Slow I/O operations
- ❌ Jenkins agent becoming unresponsive

---

## 📈 Recommended Worker Counts

### By Jenkins Agent Size

| Agent Specs | Safe Workers | Max Workers | Notes |
|-------------|--------------|-------------|-------|
| **Small** | | | |
| 2 CPU, 4GB RAM | 1-2 | 3 | Limited by RAM |
| 2 CPU, 8GB RAM | 2 | 3 | Limited by CPU |
| **Medium** | | | |
| 4 CPU, 8GB RAM | 3-4 | 6 | Balanced |
| 4 CPU, 16GB RAM | 4 | 6 | Optimal |
| **Large** | | | |
| 8 CPU, 16GB RAM | 6 | 10 | Good for CI |
| 8 CPU, 32GB RAM | 6-8 | 12 | Excellent |
| **X-Large** | | | |
| 16 CPU, 32GB RAM | 12 | 20 | Heavy parallel |
| 16 CPU, 64GB RAM | 12-16 | 24 | Max performance |

---

## 🚀 Dynamic Worker Calculation

### How It Works

**Step 1: Detect CPU Cores**
```groovy
def cpuCores = Runtime.getRuntime().availableProcessors()
```

**Step 2: Calculate 75% of Cores**
```groovy
def workers = (cpuCores * 0.75).toInteger()
```

**Step 3: Use in Test Command**
```groovy
bat "npx playwright test --workers=${env.PLAYWRIGHT_WORKERS}"
```

### Examples

| Server CPUs | Calculation | Workers Assigned |
|-------------|-------------|------------------|
| 2 cores | 2 × 0.75 = 1.5 | **1 worker** |
| 4 cores | 4 × 0.75 = 3.0 | **3 workers** |
| 6 cores | 6 × 0.75 = 4.5 | **4 workers** |
| 8 cores | 8 × 0.75 = 6.0 | **6 workers** |
| 12 cores | 12 × 0.75 = 9.0 | **9 workers** |
| 16 cores | 16 × 0.75 = 12.0 | **12 workers** |

---

## 📋 System Info Stage

### What It Does

The `System Info` stage in Jenkinsfile displays:

```
========================================
Jenkins Agent System Information
========================================
CPU Cores Available: 8
Max Memory (GB): 14.5
Playwright Workers: 6
========================================
```

### Code

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

### Benefits

✅ Visibility into agent resources  
✅ Debug performance issues  
✅ Validate worker allocation  
✅ Track resource usage over time  

---

## 🎛️ Manual Worker Override

### Method 1: Environment Variable in Jenkins

**Jenkins Dashboard → Job → Configure → Build Environment**

Add:
```
PLAYWRIGHT_WORKERS=8
```

This overrides the dynamic calculation.

### Method 2: Hardcode in Jenkinsfile

```groovy
environment {
    PLAYWRIGHT_WORKERS = "4" // Fixed 4 workers
}
```

### Method 3: Command Line Override

```groovy
bat "npx playwright test --workers=4" // Ignores environment variable
```

---

## ⚙️ Configuration Files

### playwright.config.ts

```typescript
export default defineConfig({
  workers: process.env.CI ? 3 : undefined,
  // 3 workers in CI by default
  // undefined (auto-detect) locally
});
```

**CI Detection:**
- Jenkins sets `CI=true` automatically
- Falls back to 3 workers if not overridden

### Jenkinsfile Override

```groovy
bat "npx playwright test --workers=${env.PLAYWRIGHT_WORKERS}"
```

**Override Priority:**
1. `--workers=X` flag (highest)
2. `PLAYWRIGHT_WORKERS` env variable
3. `playwright.config.ts` workers setting
4. Auto-detect (default)

---

## 🔍 Monitoring Performance

### How to Check Worker Efficiency

**1. View Console Output**
```
Running 50 tests using 6 workers

  [W0] ✓ Test 1
  [W1] ✓ Test 2
  [W2] ✓ Test 3
  [W3] ✓ Test 4
  [W4] ✓ Test 5
  [W5] ✓ Test 6
```

**2. Check Test Duration**
```groovy
echo "Tests completed in: ${currentBuild.duration}ms"
```

**3. Monitor CPU Usage**
- Jenkins Dashboard → Build → System Load
- High CPU (>90%) = workers maxed out (good)
- Low CPU (<50%) = too few workers

---

## 🐛 Troubleshooting

### Problem: Tests are slower in Jenkins

**Causes:**
- Too many workers (CPU thrashing)
- Too few workers (underutilized)
- RAM exhausted
- Disk I/O bottleneck

**Solutions:**
```groovy
// Reduce to 50% of cores
PLAYWRIGHT_WORKERS = "${(Runtime.getRuntime().availableProcessors() * 0.5).toInteger()}"

// Or fix to safe number
PLAYWRIGHT_WORKERS = "2"
```

### Problem: Out of Memory Errors

**Error:**
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solutions:**
1. Reduce workers:
   ```groovy
   PLAYWRIGHT_WORKERS = "2"
   ```

2. Increase Node.js memory:
   ```groovy
   bat "set NODE_OPTIONS=--max-old-space-size=4096 && npx playwright test --workers=4"
   ```

### Problem: Jenkins Agent Freezes

**Cause:** Too many workers consuming all resources

**Solution:**
```groovy
// Use only 50% of cores
PLAYWRIGHT_WORKERS = "${(Runtime.getRuntime().availableProcessors() / 2).toInteger()}"
```

---

## 📊 Performance Comparison

### Test Scenario: 100 Tests

| Workers | Duration | CPU Usage | RAM Usage | Efficiency |
|---------|----------|-----------|-----------|------------|
| 1 | 20 min | 25% | 1 GB | ⭐ |
| 2 | 11 min | 45% | 2 GB | ⭐⭐ |
| 4 | 6 min | 80% | 4 GB | ⭐⭐⭐⭐ |
| 6 | 4 min | 95% | 6 GB | ⭐⭐⭐⭐⭐ |
| 8 | 4.5 min | 100% | 8 GB | ⭐⭐⭐ (diminishing returns) |
| 12 | 5 min | 100% | 12 GB | ⭐⭐ (too many) |

**Sweet Spot:** 4-6 workers for most Jenkins agents

---

## 🎯 Best Practices

### ✅ Do's

✅ Use dynamic worker calculation (75% of cores)  
✅ Monitor agent performance in Jenkins  
✅ Log system info in each build  
✅ Test with different worker counts to find optimal  
✅ Use `--workers=1` for debugging failing tests  
✅ Scale workers based on test suite size  

### ❌ Don'ts

❌ Don't use more workers than CPU cores  
❌ Don't ignore RAM constraints  
❌ Don't hardcode workers without testing  
❌ Don't run all tests in parallel if they share state  
❌ Don't exceed Jenkins agent capacity  

---

## 🔗 Related Configuration

### Local Development

**playwright.config.ts:**
```typescript
workers: process.env.CI ? 3 : undefined
// CI: 3 workers
// Local: Auto-detect (usually 50% of cores)
```

### CI/CD Pipeline

**Jenkinsfile:**
```groovy
PLAYWRIGHT_WORKERS = "${(Runtime.getRuntime().availableProcessors() * 0.75).toInteger()}"
// Dynamic based on agent
```

### Test File Level

**parallel.spec.js:**
```javascript
test.describe.configure({ mode: 'parallel' });
// Force parallel within describe block
```

---

## 📚 Additional Resources

### Commands

```bash
# Run with specific workers
npx playwright test --workers=4

# Run sequentially (1 worker)
npx playwright test --workers=1

# Run with max workers
npx playwright test --workers=100%

# Check worker usage
npx playwright test --reporter=list
```

### Environment Variables

```groovy
// Jenkins
PLAYWRIGHT_WORKERS=6

// Local terminal
$env:PLAYWRIGHT_WORKERS=4  # PowerShell
export PLAYWRIGHT_WORKERS=4 # Bash
```

---

## 🔄 Version History

- **v1.0** - Static 3 workers in CI
- **v2.0** - Dynamic worker calculation (current)
- **v2.1** - Added system info logging

---

## 💡 Summary

| Aspect | Configuration |
|--------|--------------|
| **Default (Local)** | Auto-detect (50% cores) |
| **Default (CI)** | 75% of available cores |
| **Override Method** | `--workers=X` flag or env variable |
| **Monitoring** | System Info stage in Jenkinsfile |
| **Recommended** | 4-6 workers for typical Jenkins agents |

---

*Last Updated: November 14, 2025*
