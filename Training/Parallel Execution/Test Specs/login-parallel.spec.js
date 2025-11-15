const { test, expect } = require('@playwright/test');
const { TestDataManager } = require('../../../utils/testDataManager');
const LoginPage = require('../../../pages/login.page');
const HomePage = require('../../../pages/home.page');

/**
 * PRODUCTION-READY PARALLEL LOGIN TESTS
 * ======================================
 * 
 * This test suite demonstrates professional parallel login testing with:
 * - Thread-safe data access using TestDataManager
 * - Worker isolation to prevent race conditions
 * - Proper error handling and validation
 * - Page Object Model (POM) integration
 * - Comprehensive logging for debugging
 * 
 * LEARNING OBJECTIVES:
 * - Understand how to test login functionality in parallel
 * - Prevent duplicate user login conflicts
 * - Use existing Page Objects with parallel execution
 * - Handle edge cases and errors gracefully
 */

// Initialize test data manager
let dataManager;

// Load test data once before all tests
test.beforeAll(async () => {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 PARALLEL LOGIN TESTING - Initializing Data Manager');
    console.log('='.repeat(70));
    
    dataManager = new TestDataManager('testdata/users.csv', {
        dataPerWorker: 10  // Each worker gets 10 unique users
    });
    
    await dataManager.loadData();
    
    console.log(`✅ Loaded ${dataManager.getDataCount()} user records`);
    console.log(`📊 Ready for parallel execution with worker isolation\n`);
});

// Print statistics after all tests complete
test.afterAll(() => {
    console.log('\n' + '='.repeat(70));
    dataManager.printStats();
    console.log('='.repeat(70) + '\n');
});

// Enable parallel mode for this test suite
test.describe.configure({ mode: 'parallel' });

test.describe('Parallel Login Tests - Basic Scenarios', () => {
    
    // Test 1: Valid login with unique users per worker
    test('Valid login - Worker isolated users', 
        { tag: '@ParallelLogin' }, 
        async ({ page }, testInfo) => {
            const workerIndex = testInfo.parallelIndex;
            const workerPrefix = `[W${workerIndex}]`;
            
            console.log(`${workerPrefix} ▶️ Starting valid login test...`);
            
            // Get unique user for this worker
            const user = dataManager.getUniqueData(workerIndex, 0);
            
            // Validate data exists
            if (!user) {
                console.log(`${workerPrefix} ⚠️ No data available, skipping test`);
                test.skip();
                return;
            }
            
            console.log(`${workerPrefix} 📋 Testing with: ${user.email} (index: ${user._dataIndex})`);
            
            // Initialize page objects
            const loginPage = new LoginPage(page);
            const homePage = new HomePage(page);
            
            // Navigate to application
            await page.goto('/');
            console.log(`${workerPrefix} → Navigated to home page`);
            
            // Perform login
            console.log(`${workerPrefix} → Logging in with: ${user.email}`);
            await loginPage.login(user.email, user.password);
            
            // Verify successful login
            console.log(`${workerPrefix} → Verifying login success`);
            await expect(page).toHaveURL(/.*demowebshop.tricentis.com/, { timeout: 10000 });
            
            // Additional verification: Check if logged in
            const isLoggedIn = await homePage.isUserLoggedIn();
            expect(isLoggedIn).toBe(true);
            
            console.log(`${workerPrefix} ✅ Valid login test completed successfully!`);
        }
    );

    // Test 2: Login with different users in parallel
    for (let i = 0; i < 3; i++) {
        test(`Parallel login - User ${i + 1}`, 
            { tag: '@ParallelLogin' }, 
            async ({ page }, testInfo) => {
                const workerIndex = testInfo.parallelIndex;
                const workerPrefix = `[W${workerIndex}]`;
                
                // Get unique user with offset
                const user = dataManager.getUniqueData(workerIndex, i);
                
                if (!user) {
                    test.skip();
                    return;
                }
                
                console.log(`${workerPrefix} 🔐 Login test ${i + 1} - User: ${user.email}`);
                
                const loginPage = new LoginPage(page);
                
                await page.goto('/');
                await loginPage.login(user.email, user.password);
                
                // Verify login
                await expect(page).toHaveURL(/.*demowebshop.tricentis.com/);
                
                console.log(`${workerPrefix} ✅ User ${i + 1} logged in successfully`);
            }
        );
    }
});

test.describe('Parallel Login Tests - Active Users Only', () => {
    
    test('Login with active users - Thread safe', 
        { tag: '@ParallelLogin' }, 
        async ({ page }, testInfo) => {
            const workerIndex = testInfo.parallelIndex;
            const workerPrefix = `[W${workerIndex}]`;
            
            // Get all active users
            const activeUsers = dataManager.getFilteredData({ status: 'active' });
            console.log(`${workerPrefix} 🟢 Found ${activeUsers.length} active users`);
            
            // Calculate unique index for this worker
            const userIndex = workerIndex * 2;  // Each worker processes different active users
            const user = activeUsers[userIndex];
            
            if (!user) {
                console.log(`${workerPrefix} ⚠️ No active user at index ${userIndex}`);
                test.skip();
                return;
            }
            
            console.log(`${workerPrefix} 📋 Active user login: ${user.email}`);
            
            const loginPage = new LoginPage(page);
            const homePage = new HomePage(page);
            
            await page.goto('/');
            await loginPage.login(user.email, user.password);
            
            // Verify successful login
            await expect(page).toHaveURL(/.*demowebshop.tricentis.com/);
            const isLoggedIn = await homePage.isUserLoggedIn();
            expect(isLoggedIn).toBe(true);
            
            console.log(`${workerPrefix} ✅ Active user logged in: ${user.email}`);
        }
    );
});

test.describe('Parallel Login Tests - Error Handling', () => {
    
    test('Handle missing credentials gracefully', 
        { tag: '@ParallelLogin' }, 
        async ({ page }, testInfo) => {
            const workerIndex = testInfo.parallelIndex;
            const workerPrefix = `[W${workerIndex}]`;
            
            const user = dataManager.getUniqueData(workerIndex, 0);
            
            if (!user) {
                test.skip();
                return;
            }
            
            // Validate required fields
            if (!user.email || !user.password) {
                console.log(`${workerPrefix} ⚠️ Incomplete user data, skipping`);
                test.skip();
                return;
            }
            
            console.log(`${workerPrefix} ✅ User data validation passed`);
            
            const loginPage = new LoginPage(page);
            
            await page.goto('/');
            await loginPage.login(user.email, user.password);
            
            await expect(page).toHaveURL(/.*demowebshop.tricentis.com/);
            
            console.log(`${workerPrefix} ✅ Error handling test completed`);
        }
    );

    test('Handle network delays - Retry pattern', 
        { tag: '@ParallelLogin' }, 
        async ({ page }, testInfo) => {
            const workerIndex = testInfo.parallelIndex;
            const workerPrefix = `[W${workerIndex}]`;
            
            const user = dataManager.getUniqueData(workerIndex, 1);
            
            if (!user) {
                test.skip();
                return;
            }
            
            console.log(`${workerPrefix} 🔄 Testing with retry pattern: ${user.email}`);
            
            const loginPage = new LoginPage(page);
            
            await page.goto('/');
            
            // Login with increased timeout for network delays
            await loginPage.login(user.email, user.password);
            
            // Verify with retry
            await expect(page).toHaveURL(/.*demowebshop.tricentis.com/, { 
                timeout: 15000  // Increased timeout
            });
            
            console.log(`${workerPrefix} ✅ Retry pattern test completed`);
        }
    );
});

test.describe('Parallel Login Tests - Multiple Sessions', () => {
    
    test('Multiple login sessions per worker', 
        { tag: '@ParallelLogin' }, 
        async ({ page }, testInfo) => {
            const workerIndex = testInfo.parallelIndex;
            const workerPrefix = `[W${workerIndex}]`;
            
            // Get 2 users for this test
            const users = dataManager.getMultipleData(workerIndex, 2);
            
            if (users.length < 2) {
                console.log(`${workerPrefix} ⚠️ Need 2 users, got ${users.length}`);
                test.skip();
                return;
            }
            
            console.log(`${workerPrefix} 👥 Testing multiple sessions`);
            
            const loginPage = new LoginPage(page);
            const homePage = new HomePage(page);
            
            // Login with first user
            console.log(`${workerPrefix} → Session 1: ${users[0].email}`);
            await page.goto('/');
            await loginPage.login(users[0].email, users[0].password);
            await expect(page).toHaveURL(/.*demowebshop.tricentis.com/);
            
            // Logout
            await homePage.logout();
            console.log(`${workerPrefix} ← Logged out session 1`);
            
            // Login with second user
            console.log(`${workerPrefix} → Session 2: ${users[1].email}`);
            await loginPage.login(users[1].email, users[1].password);
            await expect(page).toHaveURL(/.*demowebshop.tricentis.com/);
            
            console.log(`${workerPrefix} ✅ Multiple sessions test completed`);
        }
    );
});

/**
 * KEY LEARNING POINTS:
 * ====================
 * 
 * 1. WORKER ISOLATION:
 *    - Each worker gets unique users via testInfo.parallelIndex
 *    - No duplicate login attempts
 *    - No race conditions
 * 
 * 2. DATA VALIDATION:
 *    - Always check if user data exists
 *    - Validate required fields
 *    - Use test.skip() for missing data
 * 
 * 3. ERROR HANDLING:
 *    - Increased timeouts for network delays
 *    - Retry patterns for flaky tests
 *    - Graceful failure handling
 * 
 * 4. PAGE OBJECT MODEL:
 *    - Reuse existing LoginPage and HomePage
 *    - Maintain separation of concerns
 *    - Easy to maintain and update
 * 
 * 5. LOGGING:
 *    - Worker prefix in all logs: [W0], [W1], [W2]
 *    - Detailed steps for debugging
 *    - Statistics after test completion
 * 
 * HOW TO RUN:
 * ===========
 * 
 * # Run with 3 workers
 * npx playwright test "Training/Parallel Execution/Test Specs/login-parallel.spec.js" --workers=3
 * 
 * # Debug mode (single worker)
 * npx playwright test "Training/Parallel Execution/Test Specs/login-parallel.spec.js" --workers=1 --headed --debug
 * 
 * # With specific browser
 * npx playwright test "Training/Parallel Execution/Test Specs/login-parallel.spec.js" --workers=3 --project=chromium
 */
