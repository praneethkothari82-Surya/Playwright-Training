const { test } = require('@playwright/test');

/**
 * Enhanced test with automatic screenshots and better error messages
 */
function enhancedTest(name, options, testFn) {
    if (typeof options === 'function') {
        testFn = options;
        options = {};
    }

    return test(name, options, async ({ page }, testInfo) => {
        try {
            // Add step tracking
            console.log(`Starting test: ${name}`);
            
            // Run the actual test
            await testFn({ page }, testInfo);
            
            console.log(`Test passed: ${name}`);
        } catch (error) {
            console.error(`Test failed: ${name}`);
            console.error(`Error: ${error.message}`);
            
            // Take screenshot on failure
            const screenshot = await page.screenshot({ 
                path: `test-results/failure-${testInfo.title.replace(/\s+/g, '-')}-${Date.now()}.png`,
                fullPage: true 
            });
            await testInfo.attach('failure-screenshot', { 
                body: screenshot, 
                contentType: 'image/png' 
            });
            
            // Log page URL and title
            console.error(`Page URL: ${page.url()}`);
            console.error(`Page Title: ${await page.title()}`);
            
            throw error;
        }
    });
}

/**
 * Retry action with logging
 */
async function retryAction(action, maxRetries = 3, actionName = 'Action') {
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`${actionName} - Attempt ${i + 1}`);
            await action();
            console.log(`${actionName} - Success`);
            return;
        } catch (error) {
            console.error(`${actionName} - Failed on attempt ${i + 1}: ${error.message}`);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        }
    }
}

/**
 * Log test step
 */
async function logStep(stepName, action) {
    console.log(`[STEP] ${stepName}`);
    try {
        const result = await action();
        console.log(`[STEP PASSED] ${stepName}`);
        return result;
    } catch (error) {
        console.error(`[STEP FAILED] ${stepName}: ${error.message}`);
        throw error;
    }
}

module.exports = {
    enhancedTest,
    retryAction,
    logStep
};
