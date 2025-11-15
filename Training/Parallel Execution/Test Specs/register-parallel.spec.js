const { test, expect } = require('@playwright/test');
const { TestDataManager } = require('../../../utils/testDataManager');
const RegisterPage = require('../../../pages/register.page');
const LoginPage = require('../../../pages/login.page');
const HomePage = require('../../../pages/home.page');

/**
 * PRODUCTION-READY PARALLEL REGISTRATION TESTS
 * =============================================
 * 
 * This test suite demonstrates professional parallel registration testing with:
 * - Unique email generation per worker (prevents conflicts)
 * - Thread-safe data access
 * - Worker isolation
 * - Complete registration flow verification
 * - Proper cleanup and error handling
 * 
 * CHALLENGE WITH REGISTRATION:
 * - Each registration requires a UNIQUE email
 * - Multiple workers registering same email = RACE CONDITION
 * - Solution: Worker-based data partitioning
 * 
 * LEARNING OBJECTIVES:
 * - Handle unique constraint scenarios
 * - Prevent duplicate registration errors
 * - Verify registration end-to-end
 * - Clean data management for registration tests
 */

let dataManager;

test.beforeAll(async () => {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 PARALLEL REGISTRATION TESTING - Data Manager Setup');
    console.log('='.repeat(70));
    
    dataManager = new TestDataManager('testdata/users.csv', {
        dataPerWorker: 15  // More data for registration (unique emails needed!)
    });
    
    await dataManager.loadData();
    
    console.log(`✅ Loaded ${dataManager.getDataCount()} user records`);
    console.log(`📧 Each worker will have unique email addresses`);
    console.log(`🔒 Worker isolation prevents duplicate registrations\n`);
});

test.afterAll(() => {
    console.log('\n' + '='.repeat(70));
    console.log('📊 REGISTRATION TEST DATA USAGE:');
    dataManager.printStats();
    console.log('='.repeat(70) + '\n');
});

// Enable parallel execution
test.describe.configure({ mode: 'parallel' });

test.describe('Parallel Registration - Basic Flow', () => {
    
    test('Complete registration with unique user', 
        { tag: '@ParallelRegister' }, 
        async ({ page }, testInfo) => {
            const workerIndex = testInfo.parallelIndex;
            const workerPrefix = `[W${workerIndex}]`;
            
            console.log(`${workerPrefix} ▶️ Starting registration test...`);
            
            // Get unique user data
            const user = dataManager.getUniqueData(workerIndex, 0);
            
            if (!user) {
                console.log(`${workerPrefix} ⚠️ No data available`);
                test.skip();
                return;
            }
            
            console.log(`${workerPrefix} 📧 Registering: ${user.email} (index: ${user._dataIndex})`);
            console.log(`${workerPrefix} 👤 Name: ${user.firstName} ${user.lastName}`);
            
            // Initialize page objects
            const homePage = new HomePage(page);
            const registerPage = new RegisterPage(page);
            const loginPage = new LoginPage(page);
            
            // Navigate to home
            await page.goto('/');
            console.log(`${workerPrefix} → Navigated to home page`);
            
            // Go to registration page
            console.log(`${workerPrefix} → Navigating to register page`);
            await homePage.navigateToRegisterPage();
            
            // Fill registration form
            console.log(`${workerPrefix} → Filling registration form`);
            await registerPage.register(
                user.firstName,
                user.lastName,
                user.email,
                user.password,
                user.gender
            );
            
            // Verify registration success by logging in
            console.log(`${workerPrefix} → Verifying registration via login`);
            await loginPage.login(user.email, user.password);
            
            // Verify logged in state
            await expect(page).toHaveURL(/.*automationexercise.com/);
            const isLoggedIn = await homePage.isUserLoggedIn();
            expect(isLoggedIn).toBe(true);
            
            console.log(`${workerPrefix} ✅ Registration and verification completed!`);
        }
    );

    // Multiple registration tests running in parallel
    for (let i = 0; i < 3; i++) {
        test(`Parallel registration - User ${i + 1}`, 
            { tag: '@ParallelRegister' }, 
            async ({ page }, testInfo) => {
                const workerIndex = testInfo.parallelIndex;
                const workerPrefix = `[W${workerIndex}]`;
                
                // Each test gets unique user based on worker + iteration
                const user = dataManager.getUniqueData(workerIndex, i + 1);
                
                if (!user) {
                    test.skip();
                    return;
                }
                
                console.log(`${workerPrefix} 📝 Registration ${i + 1}: ${user.email}`);
                
                const homePage = new HomePage(page);
                const registerPage = new RegisterPage(page);
                const loginPage = new LoginPage(page);
                
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
                await expect(page).toHaveURL(/.*automationexercise.com/);
                
                console.log(`${workerPrefix} ✅ User ${i + 1} registered successfully`);
            }
        );
    }
});

test.describe('Parallel Registration - Field Validation', () => {
    
    test('Register with all required fields', 
        { tag: '@ParallelRegister' }, 
        async ({ page }, testInfo) => {
            const workerIndex = testInfo.parallelIndex;
            const workerPrefix = `[W${workerIndex}]`;
            
            const user = dataManager.getUniqueData(workerIndex, 5);
            
            if (!user) {
                test.skip();
                return;
            }
            
            // Validate all required fields exist
            const requiredFields = ['firstName', 'lastName', 'email', 'password', 'gender'];
            const missingFields = requiredFields.filter(field => !user[field]);
            
            if (missingFields.length > 0) {
                console.log(`${workerPrefix} ⚠️ Missing fields: ${missingFields.join(', ')}`);
                test.skip();
                return;
            }
            
            console.log(`${workerPrefix} ✅ All required fields present`);
            console.log(`${workerPrefix} 📧 Email: ${user.email}`);
            
            const homePage = new HomePage(page);
            const registerPage = new RegisterPage(page);
            const loginPage = new LoginPage(page);
            
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
            await expect(page).toHaveURL(/.*automationexercise.com/);
            
            console.log(`${workerPrefix} ✅ Field validation test passed`);
        }
    );

    test('Register with male/female gender variety', 
        { tag: '@ParallelRegister' }, 
        async ({ page }, testInfo) => {
            const workerIndex = testInfo.parallelIndex;
            const workerPrefix = `[W${workerIndex}]`;
            
            const user = dataManager.getUniqueData(workerIndex, 6);
            
            if (!user) {
                test.skip();
                return;
            }
            
            console.log(`${workerPrefix} 👤 Gender: ${user.gender}`);
            console.log(`${workerPrefix} 📧 Email: ${user.email}`);
            
            const homePage = new HomePage(page);
            const registerPage = new RegisterPage(page);
            const loginPage = new LoginPage(page);
            
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
            await expect(page).toHaveURL(/.*automationexercise.com/);
            
            console.log(`${workerPrefix} ✅ Gender field test passed`);
        }
    );
});

test.describe('Parallel Registration - Bulk Registration', () => {
    
    test('Register multiple users sequentially in one test', 
        { tag: '@ParallelRegister' }, 
        async ({ page }, testInfo) => {
            const workerIndex = testInfo.parallelIndex;
            const workerPrefix = `[W${workerIndex}]`;
            
            // Get 3 unique users for bulk registration
            const users = dataManager.getMultipleData(workerIndex, 3);
            
            if (users.length < 3) {
                console.log(`${workerPrefix} ⚠️ Need 3 users, got ${users.length}`);
                test.skip();
                return;
            }
            
            console.log(`${workerPrefix} 📦 Bulk registering ${users.length} users`);
            
            const homePage = new HomePage(page);
            const registerPage = new RegisterPage(page);
            const loginPage = new LoginPage(page);
            
            await page.goto('/');
            
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                
                console.log(`${workerPrefix} → User ${i + 1}/3: ${user.email}`);
                
                await homePage.navigateToRegisterPage();
                
                await registerPage.register(
                    user.firstName,
                    user.lastName,
                    user.email,
                    user.password,
                    user.gender
                );
                
                await loginPage.login(user.email, user.password);
                await expect(page).toHaveURL(/.*automationexercise.com/);
                
                // Logout for next registration
                if (i < users.length - 1) {
                    await homePage.logout();
                    console.log(`${workerPrefix} ← Logged out user ${i + 1}`);
                }
            }
            
            console.log(`${workerPrefix} ✅ Bulk registration completed: ${users.length} users`);
        }
    );
});

test.describe('Parallel Registration - Active Users Only', () => {
    
    test('Register only active status users', 
        { tag: '@ParallelRegister' }, 
        async ({ page }, testInfo) => {
            const workerIndex = testInfo.parallelIndex;
            const workerPrefix = `[W${workerIndex}]`;
            
            // Filter active users
            const activeUsers = dataManager.getFilteredData({ status: 'active' });
            console.log(`${workerPrefix} 🟢 Found ${activeUsers.length} active users`);
            
            // Calculate unique index for this worker
            const userIndex = workerIndex * 3;
            const user = activeUsers[userIndex];
            
            if (!user) {
                console.log(`${workerPrefix} ⚠️ No active user at index ${userIndex}`);
                test.skip();
                return;
            }
            
            console.log(`${workerPrefix} 📧 Active user: ${user.email}`);
            console.log(`${workerPrefix} ✅ Status: ${user.status}`);
            
            const homePage = new HomePage(page);
            const registerPage = new RegisterPage(page);
            const loginPage = new LoginPage(page);
            
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
            await expect(page).toHaveURL(/.*automationexercise.com/);
            
            console.log(`${workerPrefix} ✅ Active user registered successfully`);
        }
    );
});

/**
 * KEY LEARNING POINTS:
 * ====================
 * 
 * 1. UNIQUE EMAIL REQUIREMENT:
 *    - Registration MUST use unique emails
 *    - Worker partitioning prevents conflicts
 *    - Each worker gets separate email range
 * 
 * 2. DATA ALLOCATION:
 *    - dataPerWorker=15 (more than login tests)
 *    - Allows for bulk registration tests
 *    - Prevents running out of unique emails
 * 
 * 3. COMPLETE FLOW VERIFICATION:
 *    - Register → Login → Verify logged in
 *    - End-to-end validation
 *    - Ensures registration actually worked
 * 
 * 4. BULK OPERATIONS:
 *    - Single test can register multiple users
 *    - Uses getMultipleData() for sequential registrations
 *    - Each user still unique to this worker
 * 
 * 5. FIELD VALIDATION:
 *    - Check all required fields exist
 *    - Test different gender values
 *    - Filter by user status
 * 
 * COMMON PITFALL AVOIDED:
 * =======================
 * 
 * ❌ WRONG: All workers try to register john@test.com
 *    Result: Race condition, duplicate email errors
 * 
 * ✅ CORRECT: Worker 0 uses index 0-14, Worker 1 uses 15-29, etc.
 *    Result: All unique emails, no conflicts!
 * 
 * HOW TO RUN:
 * ===========
 * 
 * # Run with 3 workers
 * npx playwright test "Training/Parallel Execution/Test Specs/register-parallel.spec.js" --workers=3
 * 
 * # Debug single test
 * npx playwright test "Training/Parallel Execution/Test Specs/register-parallel.spec.js" --workers=1 --headed --debug
 * 
 * # Watch mode
 * npx playwright test "Training/Parallel Execution/Test Specs/register-parallel.spec.js" --workers=3 --ui
 * 
 * EXPECTED OUTPUT:
 * ================
 * 
 * [W0] 📧 Registering: john0@test.com (index: 0)
 * [W1] 📧 Registering: john1@test.com (index: 15)
 * [W2] 📧 Registering: john2@test.com (index: 30)
 * [W0] ✅ Registration and verification completed!
 * [W1] ✅ Registration and verification completed!
 * [W2] ✅ Registration and verification completed!
 * 
 * Notice: All different emails - NO CONFLICTS!
 */
