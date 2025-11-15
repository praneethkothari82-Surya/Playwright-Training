const { test } = require('@playwright/test');
const { readCSV, readCSVByRow, readCSVByColumn, findRows } = require('../utils/csvReader');
const { readExcel, readExcelByRow, findRows: findExcelRows } = require('../utils/excelReader');
const LoginPage = require('../pages/login.page');
const HomePage = require('../pages/home.page');
const RegisterPage = require('../pages/register.page');

/**
 * Example test demonstrating CSV and Excel data-driven testing
 * Shows how to use the data readers for dynamic test data
 */

test.describe('Data-Driven Tests - CSV Examples', () => {
    let loginPage;
    let homePage;
    let registerPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        homePage = new HomePage(page);
        registerPage = new RegisterPage(page);
        await page.goto('/');
    });

    test('Register using CSV data - Single Row', { tag: '@DataDrivenTest' } ,async ({ page }) => {
        // Read specific row from CSV
        const userData = await readCSVByRow('testdata/users.csv', 1);
        
        console.log('Test Data:', userData);
        
        await homePage.navigateToRegisterPage();
        await registerPage.register(
            userData.firstName,
            userData.lastName,
            userData.email,
            userData.password,
            userData.gender
        );
        
        // Verify registration
        await loginPage.login(userData.email, userData.password);
    });

    test('Read all active users from CSV', { tag: '@DataDrivenTest' } ,async ({ page }) => {
        // Find all active users
        const activeUsers = await findRows('testdata/users.csv', { status: 'active' });
        
        console.log(`Found ${activeUsers.length} active users`);
        activeUsers.forEach(user => {
            console.log(`- ${user.firstName} ${user.lastName} (${user.email})`);
        });
        
        // Use first active user for test
        const testUser = activeUsers[0];
        await homePage.navigateToRegisterPage();
        await registerPage.register(
            testUser.firstName,
            testUser.lastName,
            testUser.email,
            testUser.password,
            testUser.gender
        );
    });

    test('Get all emails from CSV column', { tag: '@DataDrivenTest' } ,async ({ page }) => {
        // Read specific column
        const emails = await readCSVByColumn('testdata/users.csv', 'email');
        
        console.log('All emails from CSV:');
        emails.forEach(email => console.log(`  - ${email}`));
        
        // Verify we have data
        console.log(`Total emails: ${emails.length}`);
    });
});

test.describe('Data-Driven Tests - Iterate Through CSV', () => {
    let loginPage;
    let homePage;
    let registerPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        homePage = new HomePage(page);
        registerPage = new RegisterPage(page);
        await page.goto('/');
    });

    test('Register multiple users from CSV', { tag: '@DataDrivenTest' } ,async ({ page }, testInfo) => {
        // Read all data from CSV
        const allUsers = await readCSV('testdata/users.csv');
        
        // IMPORTANT: When looping through users in a single test, 
        // use a safe range to avoid conflicts with parallel tests
        // This test processes 2 users sequentially within one test execution
        
        // Calculate safe starting index based on worker to avoid conflicts
        // Each worker should process different users
        const workerIndex = testInfo.parallelIndex || 0;
        const startIndex = workerIndex * 10; // Give each worker 10 users' worth of space
        const endIndex = Math.min(startIndex + 2, allUsers.length); // Process 2 users max
        
        console.log(`\n[Worker ${workerIndex}] Processing users from index ${startIndex} to ${endIndex - 1}`);
        
        // Loop through users in this worker's safe range
        for (let i = startIndex; i < endIndex; i++) {
            const user = allUsers[i];
            
            // Validate user exists
            if (!user) {
                console.log(`⚠️ No user at index ${i}, skipping...`);
                continue;
            }
            
            console.log(`\n--- Registering User ${i + 1}: ${user.firstName} ${user.lastName} ---`);
            console.log(`    Email: ${user.email}`);
            console.log(`    Worker: ${workerIndex}`);
            
            await homePage.navigateToRegisterPage();
            await registerPage.register(
                user.firstName,
                user.lastName,
                user.email,
                user.password,
                user.gender
            );
            
            // Login to verify
            await loginPage.login(user.email, user.password);
            
            console.log(`✓ Successfully registered and logged in as ${user.email}`);
        }
    });
});

// Uncomment these tests once you have Excel files
/*
test.describe('Data-Driven Tests - Excel Examples', () => {
    let loginPage;
    let homePage;
    let registerPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        homePage = new HomePage(page);
        registerPage = new RegisterPage(page);
        await page.goto('/');
    });

    test('Register using Excel data - Single Row', async ({ page }) => {
        // Read specific row from Excel
        const userData = await readExcelByRow('testdata/users.xlsx', 'Users', 1);
        
        console.log('Test Data from Excel:', userData);
        
        await homePage.navigateToRegisterPage();
        await registerPage.register(
            userData.firstName,
            userData.lastName,
            userData.email,
            userData.password,
            userData.gender
        );
    });

    test('Find premium users from Excel', async ({ page }) => {
        // Find users with specific criteria
        const premiumUsers = await findExcelRows('testdata/users.xlsx', 'Users', { 
            plan: 'premium',
            status: 'active'
        });
        
        console.log(`Found ${premiumUsers.length} premium active users`);
        
        if (premiumUsers.length > 0) {
            const testUser = premiumUsers[0];
            await homePage.navigateToRegisterPage();
            await registerPage.register(
                testUser.firstName,
                testUser.lastName,
                testUser.email,
                testUser.password,
                testUser.gender
            );
        }
    });
});
*/
