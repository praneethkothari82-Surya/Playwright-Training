const HomePage = require('./home.page');

/**
 * LoginPage class for handling login page interactions
 * @class LoginPage
 * @extends HomePage
 * @tag smoketest
 * @tag regression
 */
class LoginPage extends HomePage {

constructor(page) { 
    super(page);
    this.emailInput = page.locator('input[id="Email"]');
    this.passwordInput = page.locator('input[id="Password"]');
    this.loginButton = page.locator('input[type="submit"][value="Log in"]');
    this.forgotPasswordLink = page.locator('a[href="/passwordrecovery"]');
    this.pageTitle = page.locator('div[class="page-title"] h1');
}

/**
 * Login to the application
 * @param {string} email - User email
 * @param {string} password - User password
 * @tag smoketest
 */
async login(email, password) {
    await this.navigateToLoginPage();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
}

async navigateToForgotPasswordPage() {
    await this.forgotPasswordLink.click();
    await this.page.waitForLoadState('networkidle');
}

}

module.exports = LoginPage;