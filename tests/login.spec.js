const { test, expect } = require('@playwright/test');
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

    
    test('InValid Login Test - Missing Email', {tag: '@SmokeTest',}, async ({ page }) => {

        homePage = new HomePage(page);
        let email = await homePage.emailFaker();
        await homePage.navigateToRegisterPage();
        await registerPage.register('John', 'Doe', email, 'Password123', 'male');     
        await loginPage.login(email,'Password123');

    });
});