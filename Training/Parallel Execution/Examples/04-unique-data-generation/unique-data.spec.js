const { test, expect } = require('@playwright/test');
const { uniqueDataGenerator } = require('../../../utils/uniqueDataGenerator');
const RegisterPage = require('../../../pages/register.page');
const LoginPage = require('../../../pages/login.page');
const HomePage = require('../../../pages/home.page');

/**
 * UNIQUE DATA GENERATION - Example Tests
 * ======================================
 * 
 * This test suite demonstrates guaranteed unique data generation
 * preventing ANY possibility of duplicate email/data conflicts
 * 
 * PROBLEM SOLVED:
 * - No more "email already exists" errors
 * - Safe parallel execution across unlimited workers
 * - Timestamp + Worker ID + Counter ensures uniqueness
 * 
 * WHEN TO USE:
 * - Registration/signup tests
 * - Creating new records in database
 * - Any test requiring unique identifiers
 * - High-volume parallel testing
 */
test.describe.configure({ mode: 'parallel' });

test.describe('Unique Data Generation Examples', () => {

    test('Example 1: Simple unique email generation', async ({ page }, testInfo) => {
        console.log('\n📧 Generating unique email for worker:', testInfo.parallelIndex);
        
        const registerPage = new RegisterPage(page);
        await page.goto('/');
        await registerPage.navigateToRegisterPage();
        
        // Generate guaranteed unique email
        const uniqueEmail = uniqueDataGenerator.generateUniqueEmail(testInfo.parallelIndex);
        console.log('Generated email:', uniqueEmail);
        
        await registerPage.register(
            'John',
            'Doe',
            uniqueEmail,
            'Pass@123',
            'male'
        );
        
        // Verify registration succeeded
        const homePage = new HomePage(page);
        const isLoggedIn = await homePage.isUserLoggedIn();
        expect(isLoggedIn).toBe(true);
        
        await homePage.logout();
    });

    test('Example 2: Generate complete unique user object', async ({ page }, testInfo) => {
        console.log('\n👤 Generating complete unique user data');
        
        const registerPage = new RegisterPage(page);
        await page.goto('/');
        await registerPage.navigateToRegisterPage();
        
        // Generate complete user with all unique fields
        const uniqueUser = uniqueDataGenerator.generateUniqueUser(testInfo.parallelIndex, 'testuser');
        console.log('Generated user:', JSON.stringify(uniqueUser, null, 2));
        
        await registerPage.register(
            uniqueUser.firstName,
            uniqueUser.lastName,
            uniqueUser.email,
            uniqueUser.password,
            'male'
        );
        
        const homePage = new HomePage(page);
        const isLoggedIn = await homePage.isUserLoggedIn();
        expect(isLoggedIn).toBe(true);
        
        await homePage.logout();
    });

    test('Example 3: Custom prefix email generation', async ({ page }, testInfo) => {
        console.log('\n🏷️ Generating email with custom prefix');
        
        const registerPage = new RegisterPage(page);
        await page.goto('/');
        await registerPage.navigateToRegisterPage();
        
        // Generate email with custom prefix for better identification
        const customEmail = uniqueDataGenerator.generateUniqueEmailWithPrefix(
            'qa-automation',
            testInfo.parallelIndex
        );
        console.log('Generated custom email:', customEmail);
        
        await registerPage.register(
            'Jane',
            'Smith',
            customEmail,
            'SecurePass@456',
            'female'
        );
        
        const homePage = new HomePage(page);
        const isLoggedIn = await homePage.isUserLoggedIn();
        expect(isLoggedIn).toBe(true);
        
        await homePage.logout();
    });

    test('Example 4: Multiple unique users in single test', { tag: '@UniqueParallelLogin' }, async ({ page }, testInfo) => {
        console.log('\n👥 Creating multiple unique users in one test');
        
        const registerPage = new RegisterPage(page);
        const loginPage = new LoginPage(page);
        const homePage = new HomePage(page);
        
        // Create 3 unique users
        for (let i = 0; i < 3; i++) {
            await page.goto('/');
            await registerPage.navigateToRegisterPage();
            
            const user = uniqueDataGenerator.generateUniqueUser(testInfo.parallelIndex, `user${i}`);
            console.log(`Creating user ${i + 1}:`, user.email);
            
            await registerPage.register(
                user.firstName,
                user.lastName,
                user.email,
                user.password,
                'male'
            );
            
            const isLoggedIn = await homePage.isUserLoggedIn();
            expect(isLoggedIn).toBe(true);
            
            await homePage.logout();
        }
        
        console.log('✅ Successfully created 3 unique users');
    });

    test('Example 5: Using HomePage emailFaker (timestamp-based)', { tag: '@UniqueParallelLogin' },async ({ page }) => {
        console.log('\n⏰ Using HomePage emailFaker with timestamp uniqueness');
        
        const registerPage = new RegisterPage(page);
        const homePage = new HomePage(page);
        
        await page.goto('/');
        await registerPage.navigateToRegisterPage();
        
        // Use updated emailFaker that includes timestamp
        const email = await homePage.emailFaker();
        console.log('Generated timestamp-based email:', email);
        
        await registerPage.register(
            'Test',
            'User',
            email,
            'Password@789',
            'male'
        );
        
        const isLoggedIn = await homePage.isUserLoggedIn();
        expect(isLoggedIn).toBe(true);
        
        await homePage.logout();
    });

    test('Example 6: Parallel execution safety test', { tag: '@UniqueParallelLogin' },async ({ page }, testInfo) => {
        console.log('\n🔄 Testing parallel execution safety - Worker', testInfo.parallelIndex);
        
        const registerPage = new RegisterPage(page);
        const homePage = new HomePage(page);
        
        await page.goto('/');
        await registerPage.navigateToRegisterPage();
        
        // Even if 100 workers run simultaneously, email will be unique
        const safeEmail = uniqueDataGenerator.generateUniqueEmail(testInfo.parallelIndex);
        console.log(`Worker ${testInfo.parallelIndex} email:`, safeEmail);
        
        await registerPage.register(
            `Worker${testInfo.parallelIndex}`,
            'Test',
            safeEmail,
            'ParallelPass@123',
            'male'
        );
        
        const isLoggedIn = await homePage.isUserLoggedIn();
        expect(isLoggedIn).toBe(true);
        
        await homePage.logout();
    });

    test.afterAll(() => {
        // Print statistics about generated data
        const stats = uniqueDataGenerator.getStats();
        console.log('\n📊 Unique Data Generation Statistics:');
        console.log(`   Total Generations: ${stats.counter}`);
        console.log(`   Unique Emails: ${stats.uniqueEmailsGenerated}`);
        console.log(`   Unique Usernames: ${stats.uniqueUsernamesGenerated}`);
    });
});

/**
 * PARALLEL STRESS TEST
 * Run with: npx playwright test unique-data.spec.js --workers=8
 */
test.describe('Parallel Stress Test - Unique Data', () => {
    
    // Run this test 10 times in parallel
    for (let i = 0; i < 10; i++) {
        test(`Stress test iteration ${i + 1}`, async ({ page }, testInfo) => {
            const registerPage = new RegisterPage(page);
            const homePage = new HomePage(page);
            
            await page.goto('/');
            await registerPage.navigateToRegisterPage();
            
            const uniqueEmail = uniqueDataGenerator.generateUniqueEmail(testInfo.parallelIndex);
            
            await registerPage.register(
                `StressTest${i}`,
                `Iteration${testInfo.parallelIndex}`,
                uniqueEmail,
                'StressPass@999',
                'male'
            );
            
            const isLoggedIn = await homePage.isUserLoggedIn();
            expect(isLoggedIn).toBe(true);
            
            await homePage.logout();
            
            console.log(`✅ Iteration ${i + 1}, Worker ${testInfo.parallelIndex}: Success`);
        });
    }
});
