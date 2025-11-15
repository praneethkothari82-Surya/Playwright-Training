const { expect } = require('@playwright/test');

/**
 * HomePage - Base page object for DemoWebShop homepage
 * Contains common navigation elements and search functionality
 * 
 * @property {import('@playwright/test').Page} page - Playwright page instance
 * 
 * Search Elements:
 * @property {import('@playwright/test').Locator} searchBox - Search input box - CSS: input[id="small-searchterms"]
 * @property {import('@playwright/test').Locator} searchButton - Search submit button - CSS: input[type="submit"][value="Search"]
 * 
 * Authentication Links:
 * @property {import('@playwright/test').Locator} loginLink - Login page link - CSS: a[href="/login"]
 * @property {import('@playwright/test').Locator} registerLink - Register page link - CSS: a[href="/register"]
 * 
 * Page Elements:
 * @property {import('@playwright/test').Locator} pageTitle - Page title heading - CSS: div[class="page-title"] h1
 * 
 * Shopping Elements:
 * @property {import('@playwright/test').Locator} shoppingCartLink - Shopping cart link - CSS: a[href="/cart"]
 * @property {import('@playwright/test').Locator} wishListLink - Wishlist link - CSS: a[href="/wishlist"]
 * 
 * Navigation Menu Links (Category Links):
 * @property {import('@playwright/test').Locator} computersLink - Computers category - Role: link, Name: 'Computers'
 * @property {import('@playwright/test').Locator} electronicsLink - Electronics category - Role: link, Name: 'Electronics'
 * @property {import('@playwright/test').Locator} apparelShoesLink - Apparel & Shoes category - Role: link, Name: 'Apparel & Shoes'
 * @property {import('@playwright/test').Locator} digitalDownloadsLink - Digital downloads category - Role: link, Name: 'Digital downloads'
 * @property {import('@playwright/test').Locator} jewelryLink - Jewelry category - Role: link, Name: 'Jewelry'
 * @property {import('@playwright/test').Locator} giftCardsLink - Gift Cards category - Role: link, Name: 'Gift Cards'
 */
class HomePage {
    /**
     * Initialize HomePage with Playwright page instance
     * @param {import('@playwright/test').Page} page - Playwright page object
     */
    constructor(page) {
        this.page = page;
        
        // Search Elements
        this.searchBox = page.locator('input[id="small-searchterms"]');
        this.searchButton = page.locator('input[type="submit"][value="Search"]');
        
        // Authentication Links
        this.loginLink = page.locator('a[href="/login"]');
        this.registerLink = page.locator('a[href="/register"]');
        
        // Page Elements
        this.pageTitle = page.locator('div[class="page-title"] h1');
        
        // Shopping Elements
        this.shoppingCartLink = page.locator('a[href="/cart"]');
        this.wishListLink = page.locator('a[href="/wishlist"]');
        
        // Authentication Elements
        this.logoutLink = page.locator('a[href="/logout"]');
        
        // Navigation Menu Links (Category Links)
        this.computersLink = page.getByRole('link', { name: 'Computers' });
        this.electronicsLink = page.getByRole('link', { name: 'Electronics' });
        this.apparelShoesLink = page.getByRole('link', { name: 'Apparel & Shoes' });
        this.digitalDownloadsLink = page.getByRole('link', { name: 'Digital downloads' });
        this.jewelryLink = page.getByRole('link', { name: 'Jewelry' });
        this.giftCardsLink = page.getByRole('link', { name: 'Gift Cards' });
    }

    /**
     * Navigate to the Login page
     * Clicks the login link and waits for page load
     * Verifies page title is "Welcome, Please Sign In!"
     * @returns {Promise<void>}
     * @throws {Error} If page title doesn't match expected text
     */
    async navigateToLoginPage() {
        await this.loginLink.click();
        await this.page.waitForLoadState('networkidle');
        await expect(this.pageTitle).toHaveText('Welcome, Please Sign In!');
    }

        async navigateToDesktopsPage() {
        await this.loginLink.click();
        await this.page.waitForLoadState('networkidle');
        await expect(this.pageTitle).toHaveText('Welcome, Please Sign In!');
    }

    /**
     * Navigate to the Register page
     * Clicks the register link and waits for page load
     * Verifies page title is "Register"
     * @returns {Promise<void>}
     * @throws {Error} If page title doesn't match expected text
     */
    async navigateToRegisterPage() {
        await this.registerLink.click();
        await this.page.waitForLoadState('networkidle');
        await expect(this.pageTitle).toHaveText('Register');
    }

    /**
     * Generate a random fake email address with guaranteed uniqueness
     * Uses timestamp and random components to ensure no collisions
     * @returns {Promise<string>} Generated email in format: user-{timestamp}-{random}@domain.tld
     * @example
     * const email = await homePage.emailFaker();
     * // Returns: "user-1731657890123-4567@test8901.com"
     */
    async emailFaker() {
        const timestamp = Date.now();
        const random1 = Math.floor(Math.random() * 10000);
        const random2 = Math.floor(Math.random() * 10000);
        
        // Create unique username with timestamp + random
        const username = `user-${timestamp}-${random1}`;
        
        // Create unique domain
        const domain = `test${random2}`;
        
        // Choose a random TLD
        const tlds = ['com', 'org', 'net', 'io', 'co'];
        const tld = tlds[Math.floor(Math.random() * tlds.length)];

        return `${username}@${domain}.${tld}`;
    }

    /**
     * Search for a product using the search box
     * Fills search input and clicks search button
     * @param {string} productName - Name of the product to search for
     * @returns {Promise<void>}
     * @example
     * await homePage.searchProduct('laptop');
     */
    async searchProduct(productName) {
        await this.searchBox.fill(productName);
        await this.searchButton.click();
    }

    /**
     * Check if user is logged in
     * Verifies by checking if logout link is visible
     * @returns {Promise<boolean>} True if user is logged in, false otherwise
     * @example
     * const isLoggedIn = await homePage.isUserLoggedIn();
     */
    async isUserLoggedIn() {
        try {
            return await this.logoutLink.isVisible({ timeout: 2000 });
        } catch (error) {
            return false;
        }
    }

    /**
     * Logout the current user
     * Clicks the logout link and waits for page load
     * @returns {Promise<void>}
     * @example
     * await homePage.logout();
     */
    async logout() {
        await this.logoutLink.click();
        await this.page.waitForLoadState('networkidle');
    }

}

module.exports = HomePage;