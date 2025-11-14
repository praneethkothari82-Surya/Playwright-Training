const { expect } = require('@playwright/test');
const HomePage = require('./home.page');
const LoginPage = require('./login.page');

class RegisterPage extends HomePage {

constructor(page) {
    super(page);
    this.firstNameInput = page.locator('input[id="FirstName"]');
    this.lastNameInput = page.locator('input[id="LastName"]');
    this.emailInput = page.locator('input[id="Email"]');
    this.passwordInput = page.locator('input[id="Password"]');
    this.confirmPasswordInput = page.locator('input[id="ConfirmPassword"]');
    this.registerButton = page.locator('input[type="submit"][value="Register"]');
    this.pageTitle = page.locator('div[class="page-title"] h1');
    this.genderMaleRadio = page.locator('input[id="gender-male"]');
    this.genderFemaleRadio = page.locator('input[id="gender-female"]');
    this.logoutLink = this.page.locator('a[href="/logout"]');
    this.registerConfirmationMessage = page.locator('div.result');
}

async register(firstName, lastName, email, password, gender) {
    let emailExists;
    
    if (gender === 'male') {
        await this.genderMaleRadio.check();
    } else if (gender === 'female') {
        await this.genderFemaleRadio.check();
    }
    
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.registerButton.click();
    await this.page.waitForLoadState('networkidle');
    if (emailExists = await this.page.locator(`The specified email already exists`).isVisible()){

        console.log('User already exists. Please use a different email to register.');
        return;
    }
    console.log(await this.registerConfirmationMessage.first().textContent());
    const registerText = await this.registerConfirmationMessage.first().textContent();
    expect(registerText.trim()).toContain('Your registration completed');
    

    //Logout after registration
    console.log('Logging out after registration.');
    await this.logoutLink.click();
    await this.page.waitForLoadState('networkidle');
    await this.loginLink.waitFor({ state: 'visible' });
    
}

}

module.exports = RegisterPage;