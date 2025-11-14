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
        const workerId = testInfo.parallelIndex;
        const workerIndex = process.env.TEST_WORKER_INDEX || '0';
        
        try {
            // Add step tracking with worker info
            console.log(`[Worker ${workerIndex}][Test ${workerId + 1}] Starting test: ${name}`);
            
            // Run the actual test
            await testFn({ page }, testInfo);
            
            console.log(`[Worker ${workerIndex}][Test ${workerId + 1}] Test passed: ${name}`);
        } catch (error) {
            console.error(`[Worker ${workerIndex}][Test ${workerId + 1}] Test failed: ${name}`);
            console.error(`[Worker ${workerIndex}] Error: ${error.message}`);
            
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
            console.error(`[Worker ${workerIndex}] Page URL: ${page.url()}`);
            console.error(`[Worker ${workerIndex}] Page Title: ${await page.title()}`);
            
            throw error;
        }
    });
}

/**
 * Retry action with logging
 */
async function retryAction(action, maxRetries = 3, actionName = 'Action') {
    const workerId = process.env.TEST_WORKER_INDEX || '0';
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`[Worker ${workerId}] ${actionName} - Attempt ${i + 1}`);
            await action();
            console.log(`[Worker ${workerId}] ${actionName} - Success`);
            return;
        } catch (error) {
            console.error(`[Worker ${workerId}] ${actionName} - Failed on attempt ${i + 1}: ${error.message}`);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        }
    }
}

/**
 * Log test step with worker information
 */
async function logStep(stepName, action) {
    const workerId = process.env.TEST_WORKER_INDEX || '0';
    const parallelIndex = process.env.TEST_PARALLEL_INDEX || '0';
    
    console.log(`[Worker ${workerId}][Parallel ${parallelIndex}] [STEP] ${stepName}`);
    try {
        const result = await action();
        console.log(`[Worker ${workerId}][Parallel ${parallelIndex}] [STEP PASSED] ${stepName}`);
        return result;
    } catch (error) {
        console.error(`[Worker ${workerId}][Parallel ${parallelIndex}] [STEP FAILED] ${stepName}: ${error.message}`);
        throw error;
    }
}

module.exports = {
    enhancedTest,
    retryAction,
    logStep
};
