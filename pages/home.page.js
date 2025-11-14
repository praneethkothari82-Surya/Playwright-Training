const { expect } = require('@playwright/test');

class HomePage {

    constructor(page) {
        this.page = page;
        this.searchBox = page.locator('input[id="small-searchterms"]');
        this.searchButton = page.locator('input[type="submit"][value="Search"]');
        this.loginLink = page.locator('a[href="/login"]');
        this.registerLink = page.locator('a[href="/register"]');
        this.pageTitle = page.locator('div[class="page-title"] h1');
        this.shoppingCartLink = page.locator('a[href="/cart"]');
        this.wishListLink = page.locator('a[href="/wishlist"]');
    }

    async navigateToLoginPage() {
        await this.loginLink.click();
        await this.page.waitForLoadState('networkidle');
        await expect(this.pageTitle).toHaveText('Welcome, Please Sign In!');
    }

    async navigateToRegisterPage() {
        await this.registerLink.click();
        await this.page.waitForLoadState('networkidle');
        await expect(this.pageTitle).toHaveText('Register');
    }

    async emailFaker() {
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let username = '';
        let domain = '';
        let tld = '';

        // Generate random username (e.g., 5-10 characters)
        for (let i = 0; i < Math.floor(Math.random() * 6) + 5; i++) {
            username += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Generate random domain (e.g., 5-8 characters)
        for (let i = 0; i < Math.floor(Math.random() * 4) + 5; i++) {
            domain += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Choose a random TLD
        const tlds = ['com', 'org', 'net', 'io', 'co'];
        tld = tlds[Math.floor(Math.random() * tlds.length)];

        return `${username}@${domain}.${tld}`;
    }

    async searchProduct(productName) {
        await this.searchBox.fill(productName);
        await this.searchButton.click();
    }

}

module.exports = HomePage;