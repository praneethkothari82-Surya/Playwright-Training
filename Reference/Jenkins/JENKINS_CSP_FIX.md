# Jenkins Content Security Policy Configuration

## Problem: Playwright HTML reports show blank/black screen in Jenkins

## Quick Fix (Immediate - No Restart Required)

### Steps:

1. **Go to Jenkins Script Console**
   - Navigate to: `Manage Jenkins` → `Script Console`
   - URL: http://localhost:8080/script

2. **Run this script:**

```groovy
System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "sandbox allow-scripts allow-same-origin; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;")
```

3. **Click "Run"**
4. **Refresh your report page** - It should work immediately!

**Note:** This is temporary and will reset when Jenkins restarts.

---

## Permanent Fix - Choose Your Installation Method:

### Option 1: Jenkins Installed as Windows Service

**Find jenkins.xml:**
- Default location: `C:\Program Files\Jenkins\jenkins.xml`
- Or check: `C:\Program Files (x86)\Jenkins\jenkins.xml`

**Edit jenkins.xml:**

1. **Stop Jenkins service:**
   ```powershell
   Stop-Service Jenkins
   ```

2. **Open jenkins.xml as Administrator** (use Notepad++ or similar)

3. **Find the `<arguments>` section** (it looks like this):
   ```xml
   <arguments>-Xrs -Xmx256m -Dhudson.lifecycle=hudson.lifecycle.WindowsServiceLifecycle -jar "%BASE%\jenkins.war" --httpPort=8080 --webroot="%BASE%\war"</arguments>
   ```

4. **Add the CSP parameter BEFORE `-jar`:**
   ```xml
   <arguments>-Xrs -Xmx256m -Dhudson.lifecycle=hudson.lifecycle.WindowsServiceLifecycle -Dhudson.model.DirectoryBrowserSupport.CSP="sandbox allow-scripts allow-same-origin; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;" -jar "%BASE%\jenkins.war" --httpPort=8080 --webroot="%BASE%\war"</arguments>
   ```

5. **Save the file**

6. **Start Jenkins service:**
   ```powershell
   Start-Service Jenkins
   ```

---

### Option 2: Jenkins Running as WAR File (java -jar jenkins.war)

**Add to startup command:**

```powershell
java -Dhudson.model.DirectoryBrowserSupport.CSP="sandbox allow-scripts allow-same-origin; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;" -jar jenkins.war
```

---

### Option 3: Jenkins in Docker

**Add environment variable to docker-compose.yml:**

```yaml
services:
  jenkins:
    image: jenkins/jenkins:lts
    environment:
      - JAVA_OPTS=-Dhudson.model.DirectoryBrowserSupport.CSP=sandbox allow-scripts allow-same-origin; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;
    ports:
      - "8080:8080"
```

**Or with docker run:**

```bash
docker run -e JAVA_OPTS="-Dhudson.model.DirectoryBrowserSupport.CSP=sandbox allow-scripts allow-same-origin; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;" -p 8080:8080 jenkins/jenkins:lts
```

---

### Option 4: Set via Jenkins System Properties File

**Create/Edit:** `C:\Users\[YourUser]\.jenkins\init.groovy.d\csp.groovy`

```groovy
import jenkins.model.Jenkins

System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "sandbox allow-scripts allow-same-origin; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;")

println("CSP configured for Playwright reports")
```

This runs automatically on Jenkins startup.

---

## How to Find Your jenkins.xml Location:

### PowerShell Commands:

```powershell
# Check if Jenkins is running as a service
Get-Service Jenkins

# Find jenkins.xml
Get-ChildItem -Path "C:\Program Files" -Filter "jenkins.xml" -Recurse -ErrorAction SilentlyContinue

# Alternative locations
Get-ChildItem -Path "C:\Program Files (x86)" -Filter "jenkins.xml" -Recurse -ErrorAction SilentlyContinue

# Check Jenkins home directory
$env:JENKINS_HOME
```

---

## Verify It's Working:

After applying the fix:

1. Navigate to your test report:
   `http://localhost:8080/job/Playwright-SmokeTests/[build-number]/Playwright_20Test_20Report/`

2. The report should now display properly with JavaScript working!

---

## Alternative: Use the Simple Reporter

If you don't want to modify CSP, use the **Playwright Simple Report** which works without CSP changes:
- Located at: `Playwright Simple Report` link in Jenkins build
- No JavaScript dependencies
- Works immediately with default Jenkins CSP
