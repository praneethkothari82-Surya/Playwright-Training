const { test } = require('@playwright/test');
const { TestDataManager } = require('../utils/testDataManager');
const LoginPage = require('../pages/login.page');
const HomePage = require('../pages/home.page');
const RegisterPage = require('../pages/register.page');

/**
 * THREAD-SAFE PARALLEL TESTING EXAMPLE
 * =====================================
 * 
 * This test file demonstrates how to use TestDataManager for safe parallel execution.
 * Each worker automatically gets its own unique subset of test data.
 * 
 * WHAT THIS SOLVES:
 * ----------------
 * ❌ Before: Multiple workers trying to register the same email → RACE CONDITION
 * ✅ After: Each worker gets unique data → NO CONFLICTS
 * 
 * HOW IT WORKS:
 * ------------
 * 1. TestDataManager loads all data once in beforeAll()
 * 2. Each test calls getUniqueData(workerIndex) to get data
 * 3. Worker index ensures each worker gets different data range
 * 4. Used data is tracked to prevent accidental reuse
 * 
 * DATA DISTRIBUTION WITH 3 WORKERS (dataPerWorker=10):
 * ---------------------------------------------------
 * Worker 0: Uses indices 0-9   (john.doe9er@test.com, jane.s9mithhh@test.com, etc.)
 * Worker 1: Uses indices 10-19 (john.doeer8@test.com, jane.smithhh8@test.com, etc.)
 * Worker 2: Uses indices 20-29 (john.doeer7@test.com, jane.smithhh7@test.com, etc.)
 * 
 * NO OVERLAP = NO RACE CONDITIONS!
 */

// Initialize data manager
let dataManager;

// Load data once before all tests
test.beforeAll(async () => {
    console.log('\n🚀 Initializing Thread-Safe Test Data Manager...\n');
    
    // Create data manager with 10 users per worker
    dataManager = new TestDataManager('testdata/users.csv', {
        dataPerWorker: 10  // Each worker gets 10 unique users
    });
    
    // Load all data
    await dataManager.loadData();
    
    // Print initial stats
    console.log(`📊 Data loaded: ${dataManager.getDataCount()} total records`);
    console.log(`   Each worker will have access to ${dataManager.dataPerWorker} unique records\n`);
});

// Print statistics after all tests complete
test.afterAll(() => {
    console.log('\n' + '='.repeat(60));
    dataManager.printStats();
    console.log('='.repeat(60) + '\n');
});

// Enable parallel mode for this entire describe block
test.describe.configure({ mode: 'parallel' });

test.describe('Thread-Safe Parallel User Registration', () => {
    
    // Create 5 parallel tests - each will run on different workers
    for (let i = 0; i < 5; i++) {
        test(`Safe Parallel Test ${i + 1} - Unique User`, 
            { tag: '@SafeParallel' }, 
            async ({ page }, testInfo) => {
                const workerIndex = testInfo.parallelIndex;
                const workerPrefix = `[W${workerIndex}]`;
                
                console.log(`${workerPrefix} ▶️ Test ${i + 1} starting...`);
                
                // Get unique user data for this worker
                // The 'i' parameter acts as offset within worker's data range
                const user = dataManager.getUniqueData(workerIndex, i);
                
                // Validate data was retrieved
                if (!user) {
                    console.log(`${workerPrefix} ⚠️ No data available for test ${i + 1}`);
                    test.skip();
                    return;
                }
                
                console.log(`${workerPrefix} 📋 Assigned user: ${user.email} (index: ${user._dataIndex})`);
                
                // Initialize page objects
                const loginPage = new LoginPage(page);
                const homePage = new HomePage(page);
                const registerPage = new RegisterPage(page);
                
                // Navigate to application
                await page.goto('/');
                
                // Navigate to register page
                console.log(`${workerPrefix} → Navigating to register page`);
                await homePage.navigateToRegisterPage();
                
                // Register the user with unique data
                console.log(`${workerPrefix} → Registering: ${user.firstName} ${user.lastName}`);
                await registerPage.register(
                    user.firstName,
                    user.lastName,
                    user.email,
                    user.password,
                    user.gender
                );
                
                // Login to verify registration
                console.log(`${workerPrefix} → Logging in with: ${user.email}`);
                await loginPage.login(user.email, user.password);
                
                console.log(`${workerPrefix} ✅ Test ${i + 1} completed successfully!`);
            }
        );
    }
});

test.describe('Thread-Safe Active Users Only', () => {
    
    // This test demonstrates filtering data before parallel execution
    for (let i = 0; i < 3; i++) {
        test(`Safe Active User Test ${i + 1}`, 
            { tag: '@SafeParallel' }, 
            async ({ page }, testInfo) => {
                const workerIndex = testInfo.parallelIndex;
                const workerPrefix = `[W${workerIndex}]`;
                
                // Get filtered active users
                const activeUsers = dataManager.getFilteredData({ status: 'active' });
                console.log(`${workerPrefix} 🟢 Found ${activeUsers.length} active users`);
                
                // Calculate unique index for this worker and test
                // Formula: (workerIndex * testsPerWorker) + testIteration
                const uniqueIndex = (workerIndex * 3) + i;
                
                // Get specific active user
                const user = activeUsers[uniqueIndex];
                
                if (!user) {
                    console.log(`${workerPrefix} ⚠️ No active user at calculated index ${uniqueIndex}`);
                    test.skip();
                    return;
                }
                
                console.log(`${workerPrefix} 📋 Processing active user: ${user.email}`);
                
                const loginPage = new LoginPage(page);
                const homePage = new HomePage(page);
                const registerPage = new RegisterPage(page);
                
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
                
                console.log(`${workerPrefix} ✅ Active user processed: ${user.email}`);
            }
        );
    }
});

test.describe('Multiple Users Per Test - Thread Safe', () => {
    
    test('Register 3 users in sequence (thread-safe)', 
        { tag: '@SafeParallel' }, 
        async ({ page }, testInfo) => {
            const workerIndex = testInfo.parallelIndex;
            const workerPrefix = `[W${workerIndex}]`;
            
            console.log(`${workerPrefix} 📦 Getting 3 unique users for this test...`);
            
            // Get multiple unique users for this worker
            const users = dataManager.getMultipleData(workerIndex, 3);
            
            if (users.length < 3) {
                console.log(`${workerPrefix} ⚠️ Could only get ${users.length} users, need 3`);
                test.skip();
                return;
            }
            
            console.log(`${workerPrefix} ✓ Retrieved ${users.length} unique users`);
            
            const loginPage = new LoginPage(page);
            const homePage = new HomePage(page);
            const registerPage = new RegisterPage(page);
            
            await page.goto('/');
            
            // Process each user sequentially
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                
                console.log(`${workerPrefix} → Processing user ${i + 1}/3: ${user.email}`);
                
                await homePage.navigateToRegisterPage();
                await registerPage.register(
                    user.firstName,
                    user.lastName,
                    user.email,
                    user.password,
                    user.gender
                );
                
                await loginPage.login(user.email, user.password);
                
                console.log(`${workerPrefix} ✓ User ${i + 1}/3 completed: ${user.email}`);
            }
            
            console.log(`${workerPrefix} ✅ All 3 users processed successfully!`);
        }
    );
});

/**
 * KEY CONCEPTS DEMONSTRATED:
 * =========================
 * 
 * 1. DATA PARTITIONING
 *    - Each worker gets its own unique data range
 *    - No overlap between workers = no conflicts
 * 
 * 2. AUTOMATIC TRACKING
 *    - TestDataManager tracks which data is used
 *    - Prevents accidental reuse within same test run
 * 
 * 3. VALIDATION
 *    - Always check if data exists before using
 *    - Use test.skip() when data is unavailable
 * 
 * 4. FLEXIBILITY
 *    - Single user per test: getUniqueData(workerIndex, offset)
 *    - Multiple users per test: getMultipleData(workerIndex, count)
 *    - Filtered data: getFilteredData(criteria)
 * 
 * 5. DEBUGGING
 *    - Worker prefix in logs: [W0], [W1], [W2]
 *    - Data index tracking: user._dataIndex
 *    - Statistics: dataManager.printStats()
 */
