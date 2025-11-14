const { test, expect } = require('@playwright/test');
const { logStep, retryAction } = require('../utils/testHelpers');
const LoginPage = require('../pages/login.page');
const HomePage = require('../pages/home.page');
const RegisterPage = require('../pages/register.page');

test.describe('Login Tests', () => {
    let loginPage;
    let homePage;
    let registerPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        homePage = new HomePage(page);
        registerPage = new RegisterPage(page);
        await page.goto('/');
    });


    test('Valid Login Test', {tag: '@SmokeTest',}, async ({ page }) => {

        homePage = new HomePage(page);
        let email = await homePage.emailFaker();
        await homePage.navigateToRegisterPage();
        await registerPage.register('John', 'Doe', email, 'Password123', 'male');     
        await loginPage.login(email,'Password123');

    });

    test('Valid Login Test - With Helpers', {tag: '@SmokeTest',}, async ({ page }) => {
        let email;

        await logStep('Initialize HomePage and generate email', async () => {
            homePage = new HomePage(page);
            email = await homePage.emailFaker();
            console.log(`Generated email: ${email}`);
        });

        await logStep('Navigate to Register Page', async () => {
            await retryAction(
                () => homePage.navigateToRegisterPage(),
                3,
                'Navigate to Register Page'
            );
        });

        await logStep('Register new user', async () => {
            await registerPage.register('John', 'Doe', email, 'Password123', 'male');
        });

        await logStep('Login with registered credentials', async () => {
            await loginPage.login(email, 'Password123');
        });
    });

    
    test('InValid Login Test - Missing Email', {tag: '@SmokeTest',}, async ({ page }) => {

        homePage = new HomePage(page);
        let email = await homePage.emailFaker();
        await homePage.navigateToRegisterPage();
        await registerPage.register('John', 'Doe', email, 'Password123', 'male');     
        await loginPage.login(email,'Password123');

    });
});