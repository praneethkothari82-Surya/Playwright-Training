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
        const workerId = typeof testInfo.parallelIndex === 'number' ? testInfo.parallelIndex : '?';
        
        try {
            // Add step tracking with worker info
            console.log(`[Worker ${workerId}] Starting test: ${name}`);
            
            // Run the actual test
            await testFn({ page }, testInfo);
            
            console.log(`[Worker ${workerId}] Test passed: ${name}`);
        } catch (error) {
            console.error(`[Worker ${workerId}] Test failed: ${name}`);
            console.error(`[Worker ${workerId}] Error: ${error.message}`);
            
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
            console.error(`[Worker ${workerId}] Page URL: ${page.url()}`);
            console.error(`[Worker ${workerId}] Page Title: ${await page.title()}`);
            
            throw error;
        }
    });
}

/**
 * Retry action with logging
 */
async function retryAction(action, maxRetries = 3, actionName = 'Action', testInfo = null) {
    const workerPrefix = testInfo ? `[W${testInfo.parallelIndex}] ` : '';
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`${workerPrefix}  ↻ ${actionName} - Attempt ${i + 1}`);
            await action();
            console.log(`${workerPrefix}  ✓ ${actionName} - Success`);
            return;
        } catch (error) {
            console.error(`${workerPrefix}  ✗ ${actionName} - Failed: ${error.message}`);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        }
    }
}

/**
 * Log test step
 */
async function logStep(stepName, action, testInfo = null) {
    const workerPrefix = testInfo ? `[W${testInfo.parallelIndex}] ` : '';
    console.log(`${workerPrefix}  → ${stepName}`);
    try {
        const result = await action();
        console.log(`${workerPrefix}  ✓ ${stepName}`);
        return result;
    } catch (error) {
        console.error(`${workerPrefix}  ✗ ${stepName}: ${error.message}`);
        throw error;
    }
}

module.exports = {
    enhancedTest,
    retryAction,
    logStep
};
