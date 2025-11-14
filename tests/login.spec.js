const { test, expect } = require('@playwright/test');
const { logStep, retryAction } = require('../utils/testHelpers');
const LoginPage = require('../pages/login.page');
const HomePage = require('../pages/home.page');
const RegisterPage = require('../pages/register.page');

test.describe('Login Tests', () => {
    let loginPage;
    let homePage;
    let registerPage;

    test.beforeEach(async ({ page }, testInfo) => {
        const workerPrefix = `[W${testInfo.parallelIndex}]`;
        console.log(`${workerPrefix}   → Initialize Page Objects`);
        loginPage = new LoginPage(page);
        homePage = new HomePage(page);
        registerPage = new RegisterPage(page);
        console.log(`${workerPrefix}   ✓ Initialize Page Objects`);
        console.log(`${workerPrefix}   → Navigate to Homepage`);
        await page.goto('/');
        console.log(`${workerPrefix}   ✓ Navigate to Homepage`);
    });


    test('Valid Login Test', {tag: '@SmokeTest',}, async ({ page }, testInfo) => {
        const workerPrefix = `[W${testInfo.parallelIndex}]`;
        console.log(`${workerPrefix}   → Generate email and register`);
        homePage = new HomePage(page);
        let email = await homePage.emailFaker();
        console.log(`${workerPrefix}   Generated email: ${email}`);
        await homePage.navigateToRegisterPage();
        await registerPage.register('John', 'Doe', email, 'Password123', 'male');     
        console.log(`${workerPrefix}   → Login with credentials`);
        await loginPage.login(email,'Password123');
        console.log(`${workerPrefix}   ✓ Login successful`);
    });

    test('Valid Login Test - With Helpers', {tag: '@SmokeTest',}, async ({ page }, testInfo) => {
        let email;

        await logStep('Initialize HomePage and generate email', async () => {
            homePage = new HomePage(page);
            email = await homePage.emailFaker();
            console.log(`Generated email: ${email}`);
        }, testInfo);

        await logStep('Navigate to Register Page', async () => {
            await retryAction(
                () => homePage.navigateToRegisterPage(),
                3,
                'Navigate to Register Page',
                testInfo
            );
        }, testInfo);

        await logStep('Register new user', async () => {
            await registerPage.register('John', 'Doe', email, 'Password123', 'male');
        }, testInfo);

        await logStep('Login with registered credentials', async () => {
            await loginPage.login(email, 'Password123');
        }, testInfo);
    });

    
    test('InValid Login Test - Missing Email', {tag: '@SmokeTest',}, async ({ page }, testInfo) => {
        const workerPrefix = `[W${testInfo.parallelIndex}]`;
        console.log(`${workerPrefix}   → Generate email and register`);
        homePage = new HomePage(page);
        let email = await homePage.emailFaker();
        console.log(`${workerPrefix}   Generated email: ${email}`);
        await homePage.navigateToRegisterPage();
        await registerPage.register('John', 'Doe', email, 'Password123', 'male');     
        console.log(`${workerPrefix}   → Login with credentials`);
        await loginPage.login(email,'Password123');
        console.log(`${workerPrefix}   ✓ Login successful`);
    });
});