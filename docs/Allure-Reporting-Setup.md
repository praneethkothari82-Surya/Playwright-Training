# Allure Reporting Setup for Jenkins

## 📊 Overview

Allure is a flexible, lightweight reporting framework that provides detailed test execution reports with:
- Test execution trends
- Test history and flakiness detection
- Screenshots and video attachments
- Detailed test steps and logs
- Beautiful, interactive UI

## 🚀 Quick Start

### 1. Package Installation

Already installed in this project:
```bash
npm install --save-dev allure-playwright
```

### 2. Playwright Configuration

Allure reporter is configured in `playwright.config.ts`:
```typescript
reporter: [
  ['allure-playwright', { 
    outputFolder: 'allure-results',
    detail: true,
    suiteTitle: true,
    environmentInfo: {
      'Environment': process.env.CI ? 'Jenkins CI' : 'Local',
      'Node Version': process.version,
      'Base URL': 'https://demowebshop.tricentis.com/'
    }
  }],
  // ... other reporters
]
```

### 3. Jenkins Setup

#### Install Allure Plugin in Jenkins

1. Go to **Jenkins** → **Manage Jenkins** → **Manage Plugins**
2. Click **Available** tab
3. Search for **Allure**
4. Install **Allure Jenkins Plugin**
5. Restart Jenkins

#### Configure Allure in Jenkins

1. Go to **Manage Jenkins** → **Global Tool Configuration**
2. Scroll to **Allure Commandline**
3. Click **Add Allure Commandline**
4. Name: `Allure` (or any name)
5. Install automatically: ✅ Check
6. Version: Select latest (e.g., 2.24.0)
7. Save

#### Jenkinsfile Configuration

Already configured in `Jenkinsfile`:
```groovy
post {
    always {
        // Publish Allure Report
        allure([
            includeProperties: false,
            jdk: '',
            properties: [],
            reportBuildPolicy: 'ALWAYS',
            results: [[path: 'allure-results']]
        ])
    }
}
```

---

## 📝 Enhanced Test Annotations

### Using Allure Annotations

```javascript
const { test, expect } = require('@playwright/test');
const allure = require('allure-playwright');

test('User Registration', async ({ page }, testInfo) => {
    // Add description
    await allure.description('This test verifies user registration functionality');
    
    // Add severity
    await allure.severity('critical');
    
    // Add tags
    await allure.tag('registration', 'smoke');
    
    // Add owner
    await allure.owner('QA Team');
    
    // Add epic/feature/story
    await allure.epic('User Management');
    await allure.feature('Registration');
    await allure.story('New User Signup');
    
    // Test steps
    await allure.step('Navigate to registration page', async () => {
        await page.goto('/register');
    });
    
    await allure.step('Fill registration form', async () => {
        await page.fill('#email', 'user@test.com');
        await page.fill('#password', 'pass123');
    });
    
    await allure.step('Submit form', async () => {
        await page.click('button[type="submit"]');
    });
    
    await allure.step('Verify registration success', async () => {
        await expect(page).toHaveURL(/.*\/home/);
    });
});
```

### Attach Screenshots/Videos

```javascript
test('Login Test', async ({ page }, testInfo) => {
    // Automatic attachment (configured in playwright.config.ts)
    // Screenshots on failure: screenshot: 'only-on-failure'
    // Videos on failure: video: 'retain-on-failure'
    
    // Manual attachment
    const screenshot = await page.screenshot();
    await allure.attachment('Login Page', screenshot, 'image/png');
});
```

### Add Parameters

```javascript
test('Search Product', async ({ page }) => {
    const product = 'laptop';
    
    await allure.parameter('Product', product);
    await allure.parameter('Category', 'Electronics');
    
    await page.goto('/');
    await page.fill('#search', product);
    await page.click('#search-btn');
});
```

---

## 🎯 Example Test with Full Allure Integration

```javascript
const { test, expect } = require('@playwright/test');
const allure = require('allure-playwright');
const { uniqueDataGenerator } = require('../utils/uniqueDataGenerator');
const RegisterPage = require('../pages/register.page');

test.describe('User Registration Suite', () => {
    
    test('Successful user registration', async ({ page }, testInfo) => {
        // Metadata
        await allure.epic('User Management');
        await allure.feature('Registration');
        await allure.story('New user can register successfully');
        await allure.severity('blocker');
        await allure.owner('QA Team');
        await allure.tag('smoke', 'regression', 'registration');
        await allure.description('Verify that a new user can register with valid credentials');
        
        const registerPage = new RegisterPage(page);
        const user = uniqueDataGenerator.generateUniqueUser(testInfo.parallelIndex);
        
        // Add test parameters
        await allure.parameter('Email', user.email);
        await allure.parameter('Worker ID', testInfo.parallelIndex);
        
        await allure.step('Navigate to application', async () => {
            await page.goto('/');
        });
        
        await allure.step('Navigate to registration page', async () => {
            await registerPage.navigateToRegisterPage();
        });
        
        await allure.step('Fill registration form', async () => {
            await registerPage.register(
                user.firstName,
                user.lastName,
                user.email,
                user.password,
                'male'
            );
        });
        
        await allure.step('Verify registration success', async () => {
            const isLoggedIn = await registerPage.isUserLoggedIn();
            expect(isLoggedIn).toBe(true);
        });
        
        // Attach additional info
        await allure.attachment('User Data', JSON.stringify(user, null, 2), 'application/json');
    });
});
```

---

## 🖥️ Viewing Reports

### Local Development

1. Run tests:
```bash
npx playwright test
```

2. Generate and open Allure report:
```bash
# Install Allure CLI globally
npm install -g allure-commandline

# Generate report
allure generate allure-results --clean -o allure-report

# Open report
allure open allure-report
```

Or use npm scripts (add to `package.json`):
```json
{
  "scripts": {
    "allure:generate": "allure generate allure-results --clean -o allure-report",
    "allure:open": "allure open allure-report",
    "allure:report": "npm run allure:generate && npm run allure:open"
  }
}
```

Then run:
```bash
npm run allure:report
```

### Jenkins CI/CD

1. Run your Jenkins pipeline
2. After build completes, click **Allure Report** in build sidebar
3. Interactive report opens with:
   - Overview dashboard
   - Test suites
   - Test trends
   - Graphs and charts
   - Failed test details
   - Screenshots/videos

---

## 📊 Report Features

### Overview Dashboard
- Total tests, passed, failed, skipped
- Success rate percentage
- Execution time
- Trends over builds

### Categories
- Product defects
- Test defects
- Known issues
- Broken tests

### Suites
- Organized by test suites
- Expandable test cases
- Test steps breakdown

### Graphs
- Status breakdown pie chart
- Duration trends
- Severity distribution
- Feature/Story coverage

### Timeline
- Test execution timeline
- Parallel execution visualization
- Duration comparison

### Behaviors
- Organized by Epic → Feature → Story
- Business-oriented view
- Requirements traceability

---

## 🔧 Configuration Options

### Advanced Playwright Config

```typescript
['allure-playwright', {
    outputFolder: 'allure-results',
    detail: true,
    suiteTitle: true,
    categories: [
        {
            name: 'Product Defects',
            matchedStatuses: ['failed']
        },
        {
            name: 'Test Defects',
            matchedStatuses: ['broken']
        }
    ],
    environmentInfo: {
        'Environment': 'Jenkins CI',
        'Browser': 'Chromium',
        'Node Version': process.version,
        'Base URL': 'https://demowebshop.tricentis.com/',
        'Test Data': 'users.csv'
    }
}]
```

### Jenkins Allure Plugin Options

```groovy
allure([
    includeProperties: false,
    jdk: '',
    properties: [],
    reportBuildPolicy: 'ALWAYS',  // ALWAYS, UNSTABLE, or UNSUCCESSFUL
    results: [[path: 'allure-results']],
    reportName: 'Playwright Allure Report',
    reportTitle: 'Test Execution Report'
])
```

---

## 🎨 Severity Levels

Use severity to prioritize test failures:

- **blocker** - Critical tests that block releases
- **critical** - High priority tests
- **normal** - Standard tests (default)
- **minor** - Low priority tests
- **trivial** - Nice to have tests

```javascript
await allure.severity('blocker');
await allure.severity('critical');
await allure.severity('normal');
await allure.severity('minor');
await allure.severity('trivial');
```

---

## 🏷️ Organizing Tests

### By Epic/Feature/Story

```javascript
await allure.epic('E-Commerce');           // High level
await allure.feature('Shopping Cart');      // Mid level
await allure.story('Add items to cart');    // Low level
```

### By Tags

```javascript
await allure.tag('smoke');
await allure.tag('regression');
await allure.tag('critical-path');
```

### By Owner

```javascript
await allure.owner('John Doe');
await allure.owner('QA Team');
```

---

## 🐛 Troubleshooting

### Issue: Allure report not showing in Jenkins

**Solution:**
1. Check Allure plugin is installed
2. Verify Allure Commandline is configured in Global Tool Configuration
3. Check `allure-results` folder exists after test run
4. Review Jenkins console output for errors

### Issue: Screenshots/videos not attached

**Solution:**
```typescript
// In playwright.config.ts
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'retain-on-failure'
}
```

### Issue: Report shows "No results"

**Solution:**
- Ensure tests ran and generated `allure-results` folder
- Check `outputFolder: 'allure-results'` in config
- Verify path in Jenkinsfile: `results: [[path: 'allure-results']]`

---

## 📈 Best Practices

1. **Use descriptive test names** - Shows clearly in report
2. **Add severity** - Helps prioritize failures
3. **Use steps** - Makes test flow clear
4. **Add parameters** - Shows test inputs
5. **Tag appropriately** - Enables filtering
6. **Add descriptions** - Explains test purpose
7. **Attach evidence** - Screenshots, logs, data
8. **Organize by epic/feature** - Business alignment

---

## 📚 Additional Resources

- [Allure Documentation](https://docs.qameta.io/allure/)
- [Allure Playwright](https://www.npmjs.com/package/allure-playwright)
- [Jenkins Allure Plugin](https://plugins.jenkins.io/allure-jenkins-plugin/)

---

## ✅ Verification Checklist

- [x] allure-playwright package installed
- [x] Allure reporter configured in playwright.config.ts
- [x] allure-results in .gitignore
- [x] Jenkinsfile updated with allure step
- [ ] Allure plugin installed in Jenkins
- [ ] Allure Commandline configured in Jenkins
- [ ] Run test pipeline to verify report generation
