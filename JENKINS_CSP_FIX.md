# Jenkins Content Security Policy Configuration

## Problem: Playwright HTML reports show blank/black screen in Jenkins

## Solution: Update Jenkins CSP settings

### Steps:

1. **Go to Jenkins Dashboard**
   - Navigate to: `Manage Jenkins` → `Script Console`
   - URL: http://localhost:8080/script

2. **Run this script in the Script Console:**

```groovy
System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "sandbox allow-scripts allow-same-origin; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;")
```

3. **Click "Run"**

4. **Make it permanent** - Add to Jenkins startup parameters:
   - Windows: Edit `jenkins.xml` and add to `<arguments>`:
     ```
     -Dhudson.model.DirectoryBrowserSupport.CSP="sandbox allow-scripts allow-same-origin; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
     ```
   
   - Docker: Add environment variable:
     ```
     JAVA_OPTS="-Dhudson.model.DirectoryBrowserSupport.CSP=sandbox allow-scripts allow-same-origin; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
     ```

5. **Restart Jenkins** for permanent changes

---

## Option 2: Use Different Reporter (Alternative)

If you cannot modify Jenkins CSP, use a simpler HTML reporter that works with strict CSP.

---

## Quick Test:
After running the script console command, refresh your report page:
http://localhost:8080/job/Playwright-SmokeTests/2/Playwright_20Test_20Report/

The report should now display properly!
