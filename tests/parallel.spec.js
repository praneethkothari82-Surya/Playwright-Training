const { test } = require('@playwright/test');
const { readCSV } = require('../utils/csvReader');
const LoginPage = require('../pages/login.page');
const HomePage = require('../pages/home.page');
const RegisterPage = require('../pages/register.page');

/**
 * Parallel Data-Driven Testing Examples
 * Demonstrates how to utilize all workers for parallel execution
 * Each user from CSV gets their own test that runs in parallel
 */

// Load test data once before all tests
let allUsers = [];

test.beforeAll(async () => {
    allUsers = await readCSV('testdata/users.csv');
    console.log(`\n📊 Loaded ${allUsers.length} users from CSV for parallel testing\n`);
});

// Configure this describe block to run tests in parallel
test.describe.configure({ mode: 'parallel' });

test.describe('Parallel User Registration - All Workers Active', () => {
    
    // Dynamically create one test per user
    // Each test will run in a separate worker (up to worker limit)
    for (let i = 0; i < 5; i++) {
        test(`Register User ${i + 1} in Parallel`, { tag: '@ParallelTest' }, async ({ page }, testInfo) => {
            const workerPrefix = `[W${testInfo.parallelIndex}]`;
            
            // Initialize page objects
            const loginPage = new LoginPage(page);
            const homePage = new HomePage(page);
            const registerPage = new RegisterPage(page);
            
            // Get user data for this test
            const user = allUsers[i];
            
            if (!user) {
                console.log(`${workerPrefix} ⚠️ No user data for index ${i}`);
                test.skip();
                return;
            }
            
            console.log(`${workerPrefix} 🚀 Starting registration for: ${user.firstName} ${user.lastName}`);
            
            // Navigate to home page
            await page.goto('/');
            
            // Navigate to register page
            console.log(`${workerPrefix} → Navigate to Register Page`);
            await homePage.navigateToRegisterPage();
            
            // Register the user
            console.log(`${workerPrefix} → Register user: ${user.email}`);
            await registerPage.register(
                user.firstName,
                user.lastName,
                user.email,
                user.password,
                user.gender
            );
            
            // Login to verify registration
            console.log(`${workerPrefix} → Login with credentials`);
            await loginPage.login(user.email, user.password);
            
            console.log(`${workerPrefix} ✅ Successfully registered and logged in: ${user.email}`);
        });
    }
});

test.describe('Parallel Active Users Only', () => {
    let activeUsers = [];
    
    test.beforeAll(async () => {
        // Filter only active users
        activeUsers = allUsers.filter(user => user.status === 'active');
        console.log(`\n🟢 Found ${activeUsers.length} active users for parallel testing\n`);
    });
    
    // Create parallel tests for active users only
    for (let i = 0; i < 4; i++) {
        test(`Register Active User ${i + 1}`, { tag: '@ParallelTest' }, async ({ page }, testInfo) => {
            const workerPrefix = `[W${testInfo.parallelIndex}]`;
            const user = activeUsers[i];
            
            if (!user) {
                console.log(`${workerPrefix} ⚠️ No active user at index ${i}`);
                test.skip();
                return;
            }
            
            const loginPage = new LoginPage(page);
            const homePage = new HomePage(page);
            const registerPage = new RegisterPage(page);
            
            console.log(`${workerPrefix} 🟢 Processing active user: ${user.firstName} ${user.lastName}`);
            
            await page.goto('/');
            await homePage.navigateToRegisterPage();
            
            await registerPage.register(
                user.firstName,
                user.lastName,
                user.email,
                user.password,
                user.gender
            );
            
            await loginPage.login(user.email, user.password);
            
            console.log(`${workerPrefix} ✅ Active user registered: ${user.email}`);
        });
    }
});

test.describe('Dynamic Parallel Tests - forEach Pattern', () => {
    
    test.beforeAll(async () => {
        console.log(`\n🔄 Dynamic test generation for ${allUsers.length} users\n`);
    });
    
    // Alternative pattern: Use forEach to generate tests
    allUsers.slice(0, 3).forEach((user, index) => {
        test(`Dynamic Test ${index + 1}: ${user.firstName} ${user.lastName}`, 
            { tag: '@DynamicParallel' }, 
            async ({ page }, testInfo) => {
                const workerPrefix = `[W${testInfo.parallelIndex}]`;
                
                const loginPage = new LoginPage(page);
                const homePage = new HomePage(page);
                const registerPage = new RegisterPage(page);
                
                console.log(`${workerPrefix} 🔄 Dynamic test for: ${user.email}`);
                
                await page.goto('/');
                await homePage.navigateToRegisterPage();
                
                await registerPage.register(
                    user.firstName,
                    user.lastName,
                    user.email,
                    user.password,
                    user.gender
                );
                
                await loginPage.login(user.email, user.password);
                
                console.log(`${workerPrefix} ✅ Dynamic test completed: ${user.email}`);
            }
        );
    });
});

/**
 * Explanation of Parallel Execution:
 * 
 * With 4 workers configured:
 * - Test 1 → Worker 0
 * - Test 2 → Worker 1  
 * - Test 3 → Worker 2
 * - Test 4 → Worker 3
 * - Test 5 → Worker 0 (after Test 1 completes)
 * 
 * All workers are utilized simultaneously!
 * 
 * To run these tests:
 * npx playwright test parallel --workers=4
 * npx playwright test --grep "@ParallelTest" --workers=4
 * npx playwright test --grep "@DynamicParallel" --workers=3
 */
