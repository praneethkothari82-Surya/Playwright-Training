# Jenkins Pipeline Troubleshooting Guide

## 🔍 Common Issues & Solutions

### Issue 1: "Stage skipped due to earlier failure(s)"

**Cause:** A previous stage failed, causing Jenkins to skip subsequent stages.

**Solution:** The updated Jenkinsfile now includes:
- ✅ Try-catch blocks around each stage
- ✅ Better error messages with ✓/✗/⚠ indicators
- ✅ Fallback mechanisms (e.g., `npm install` if `npm ci` fails)
- ✅ Continues execution even if non-critical stages fail
- ✅ Sets build status to UNSTABLE instead of FAILED when appropriate

**How to debug:**
1. Check Jenkins console output for the first ✗ (failure) message
2. Look at the specific error message
3. Fix that stage first

---

### Issue 2: "npm ci" fails

**Possible Causes:**
- `node_modules` folder exists and conflicts
- `package-lock.json` is out of sync
- Permissions issues
- Network/registry issues

**Solutions:**

**Option 1: Use the updated Jenkinsfile (already implemented)**
```groovy
// Automatically falls back to npm install if npm ci fails
try {
    bat 'npm ci'
} catch (Exception e) {
    bat 'npm install'  // Fallback
}
```

**Option 2: Clean workspace before build**
```groovy
stage('Clean Workspace') {
    steps {
        deleteDir()  // Delete everything
        checkout scm  // Fresh checkout
    }
}
```

**Option 3: Manual Jenkins job cleanup**
1. Go to Jenkins job
2. Click "Workspace" in sidebar
3. Click "Wipe Out Current Workspace"
4. Run build again

---

### Issue 3: Playwright browsers not installing

**Possible Causes:**
- Network issues
- Disk space
- Permissions
- Already installed but corrupted

**Solutions:**

**Check disk space:**
```groovy
stage('Check Disk Space') {
    steps {
        bat 'wmic logicaldisk get size,freespace,caption'
    }
}
```

**Install only needed browser (already in updated Jenkinsfile):**
```bash
npx playwright install --with-deps chromium
# Instead of: npx playwright install --with-deps (all browsers)
```

**Clear Playwright cache:**
```bash
rd /s /q %USERPROFILE%\AppData\Local\ms-playwright
npx playwright install --with-deps chromium
```

---

### Issue 4: Tests fail but build continues

**Expected Behavior:** Updated Jenkinsfile sets build to UNSTABLE instead of FAILED
- Tests run
- Reports are generated
- Build marked as ⚠ UNSTABLE (not ✗ FAILED)
- You can still view reports

**To make tests fail the build:**
```groovy
stage('Run Tests') {
    steps {
        bat "npx playwright test --workers=${env.PLAYWRIGHT_WORKERS}"
        // Remove try-catch - will fail build on test failure
    }
}
```

---

### Issue 5: Allure report not showing

**Solutions:**

**1. Verify Allure plugin installed:**
- Jenkins → Manage Jenkins → Manage Plugins
- Search "Allure"
- Install if missing

**2. Configure Allure Commandline:**
- Manage Jenkins → Global Tool Configuration
- Scroll to "Allure Commandline"
- Add installation if missing

**3. Check allure-results folder exists:**
```groovy
stage('Verify Allure Results') {
    steps {
        bat 'dir allure-results'  // Check folder exists
    }
}
```

**4. Check Jenkinsfile has allure step:**
```groovy
allure([
    results: [[path: 'allure-results']]
])
```

---

### Issue 6: HTML reports show blank page (CSP issues)

**Cause:** Jenkins Content Security Policy blocks scripts

**Solution 1: Use Simple HTML Report (CSP-friendly)**
- Already configured in Jenkinsfile
- Access via "Playwright Simple Report" link

**Solution 2: Configure CSP in Jenkins**
1. Manage Jenkins → Script Console
2. Run:
```groovy
System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "")
```
3. Restart Jenkins

**Solution 3: View report locally**
1. Download `playwright-report` artifact
2. Extract and open `index.html` in browser

---

### Issue 7: Jenkins agent doesn't have Node.js

**Solution: Install Node.js on Jenkins agent**

**Windows:**
```powershell
# Download and install Node.js LTS
winget install OpenJS.NodeJS.LTS
```

**Or configure Node.js in Jenkins:**
1. Manage Jenkins → Global Tool Configuration
2. Add NodeJS installation
3. Update Jenkinsfile:
```groovy
tools {
    nodejs 'NodeJS-18'  // Name from Global Tool Configuration
}
```

---

### Issue 8: Permission denied errors

**Windows Solution:**
```groovy
stage('Set Permissions') {
    steps {
        bat 'icacls . /grant Everyone:(OI)(CI)F /T'
    }
}
```

**Or run Jenkins agent as Administrator**

---

### Issue 9: Tests run but no results in reports

**Check test match patterns:**
```javascript
// playwright.config.ts
testMatch: ['tests/**/*.spec.{js,ts}', 'Training/**/*.spec.{js,ts}']
```

**Verify tests have tags:**
```javascript
test('@SmokeTest User login', async ({ page }) => {
    // Test code
});
```

**Check grep pattern in Jenkinsfile:**
```groovy
bat "npx playwright test --grep \"@SmokeTest\""
```

---

### Issue 10: Build is slow

**Optimizations:**

**1. Use npm ci instead of npm install** (already implemented)
```bash
npm ci  # Faster, uses package-lock.json
```

**2. Cache node_modules between builds:**
```groovy
// Add to Jenkinsfile
options {
    skipDefaultCheckout()
}

stage('Checkout with Cache') {
    steps {
        script {
            if (!fileExists('node_modules')) {
                checkout scm
                bat 'npm ci'
            } else {
                checkout scm
                echo 'Using cached node_modules'
            }
        }
    }
}
```

**3. Install only chromium** (already in updated Jenkinsfile)
```bash
npx playwright install --with-deps chromium
```

**4. Reduce workers if needed:**
```groovy
env.PLAYWRIGHT_WORKERS = '2'  // Instead of auto-detect
```

---

## 🛠️ Debugging Commands

### Check Jenkins agent environment
```groovy
stage('Debug Info') {
    steps {
        bat 'echo %PATH%'
        bat 'node --version'
        bat 'npm --version'
        bat 'npx playwright --version'
        bat 'dir'
    }
}
```

### Verbose test output
```bash
npx playwright test --reporter=list --debug
```

### Check installed browsers
```bash
npx playwright install --dry-run
```

### Test Playwright installation
```bash
npx playwright test --list
```

---

## 📋 Updated Jenkinsfile Features

The updated Jenkinsfile includes:

✅ **Better error handling** - Try-catch blocks around each stage
✅ **Visual indicators** - ✓ success, ✗ failure, ⚠ warning
✅ **Fallback mechanisms** - npm install if npm ci fails
✅ **Artifact cleanup** - Removes old results before running
✅ **Detailed logging** - Shows Node/NPM versions
✅ **Graceful degradation** - Continues even if non-critical stages fail
✅ **UNSTABLE vs FAILED** - Reports still generated on test failures
✅ **Chromium-only** - Faster browser installation
✅ **CI environment** - Sets CI=true

---

## 🚀 Quick Fixes Checklist

When build fails, check in this order:

1. ✅ **Check Jenkins console** - Find first ✗ error
2. ✅ **Verify Node.js installed** - `node --version`
3. ✅ **Check workspace clean** - No leftover files
4. ✅ **Verify package-lock.json exists** - In repo
5. ✅ **Check disk space** - Playwright needs ~1GB
6. ✅ **Network access** - Can download packages/browsers
7. ✅ **Permissions** - Jenkins can write files
8. ✅ **Allure plugin installed** - If using Allure reports

---

## 📞 Getting Help

**Check logs locations:**
- Jenkins console output: Build → Console Output
- Playwright traces: `test-results/` folder (archived)
- Screenshots: `test-results/` folder (archived)
- Videos: `test-results/` folder (archived)

**Download artifacts:**
1. Go to build page
2. Scroll to "Build Artifacts"
3. Download entire folder or specific files

---

## 🎯 Best Practices

1. **Keep Jenkins workspace clean** - Use cleanup stage
2. **Use npm ci in CI** - Faster and more reliable
3. **Set build to UNSTABLE on test failures** - Still get reports
4. **Install only needed browsers** - Chromium for speed
5. **Use try-catch for non-critical stages** - Don't block entire pipeline
6. **Add verbose logging** - Easier debugging
7. **Archive all artifacts** - Screenshots, videos, traces
8. **Use multiple reporters** - JUnit, HTML, Allure
