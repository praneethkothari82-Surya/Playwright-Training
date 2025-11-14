const { test, expect } = require('@playwright/test');
const { logStep, retryAction } = require('../utils/testHelpers');
const LoginPage = require('../pages/login.page');
const HomePage = require('../pages/home.page');
const RegisterPage = require('../pages/register.page');

test.describe('Login Tests - Enhanced', () => {
    let loginPage;
    let homePage;
    let registerPage;

    test.beforeEach(async ({ page }, testInfo) => {
        await logStep('Initialize Page Objects', async () => {
            loginPage = new LoginPage(page);
            homePage = new HomePage(page);
            registerPage = new RegisterPage(page);
        }, testInfo);

        await logStep('Navigate to Homepage', async () => {
            await page.goto('/');
        }, testInfo);
    });

    test('Valid Login with Enhanced Logging', { tag: '@SmokeTest' }, async ({ page }, testInfo) => {
        let email;

        await logStep('Generate email', async () => {
            homePage = new HomePage(page);
            email = await homePage.emailFaker();
            console.log(`Generated email: ${email}`);
        }, testInfo);

        await logStep('Navigate to register page', async () => {
            await retryAction(
                () => homePage.navigateToRegisterPage(),
                3,
                'Navigate to Register',
                testInfo
            );
        }, testInfo);

        await logStep('Register new user', async () => {
            await registerPage.register('John', 'Doe', email, 'Password123', 'male');
        }, testInfo);

        await logStep('Login with credentials', async () => {
            await loginPage.login(email, 'Password123');
        }, testInfo);

        await logStep('Verify login success', async () => {
            // Add your verification logic here
            console.log('Login completed successfully');
        }, testInfo);
    });
});
