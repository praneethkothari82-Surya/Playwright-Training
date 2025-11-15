const { test } = require('@playwright/test');

/**
 * EXAMPLE 1: BASIC PARALLEL EXECUTION
 * ====================================
 * 
 * This is the simplest example to understand parallel testing.
 * No data dependencies, just basic tests running in parallel.
 * 
 * WHAT YOU'LL LEARN:
 * - How to enable parallel mode
 * - How tests are distributed across workers
 * - Performance improvement from parallelization
 * 
 * BEFORE YOU RUN:
 * - Make sure you understand what workers are (see Documentation/02-Workers.md)
 * - Have playwright installed: npm install
 * 
 * HOW TO RUN:
 * -----------
 * # Run with 1 worker (sequential)
 * npx playwright test "Training/Parallel Execution/Examples/01-basic-parallel.spec.js" --workers=1
 * 
 * # Run with 3 workers (parallel)
 * npx playwright test "Training/Parallel Execution/Examples/01-basic-parallel.spec.js" --workers=3
 * 
 * # Compare the execution times!
 */

// ✅ STEP 1: Enable parallel mode for this test suite
test.describe.configure({ mode: 'parallel' });

test.describe('Basic Parallel Execution Example', () => {
    
    // Create 9 simple tests
    // These will be automatically distributed across available workers
    for (let i = 1; i <= 9; i++) {
        test(`Simple test ${i}`, async ({ page }, testInfo) => {
            // Get worker information
            const workerIndex = testInfo.parallelIndex;
            const workerPrefix = `[W${workerIndex}]`;
            
            console.log(`${workerPrefix} ⚡ Running test ${i}`);
            
            // Navigate to a simple page
            await page.goto('https://example.com');
            
            // Simulate some work (wait 2 seconds)
            console.log(`${workerPrefix} ⏳ Test ${i} working...`);
            await page.waitForTimeout(2000);
            
            console.log(`${workerPrefix} ✅ Test ${i} completed!`);
        });
    }
});

/**
 * OBSERVE THE DIFFERENCE:
 * =======================
 * 
 * WITH --workers=1 (Sequential):
 * ------------------------------
 * [W0] ⚡ Running test 1
 * [W0] ✅ Test 1 completed!
 * [W0] ⚡ Running test 2
 * [W0] ✅ Test 2 completed!
 * ...
 * Total time: ~18 seconds (9 tests × 2 seconds)
 * 
 * WITH --workers=3 (Parallel):
 * ----------------------------
 * [W0] ⚡ Running test 1
 * [W1] ⚡ Running test 2
 * [W2] ⚡ Running test 3
 * [W0] ✅ Test 1 completed!
 * [W0] ⚡ Running test 4
 * [W1] ✅ Test 2 completed!
 * [W1] ⚡ Running test 5
 * [W2] ✅ Test 3 completed!
 * [W2] ⚡ Running test 6
 * ...
 * Total time: ~6 seconds (9 tests ÷ 3 workers × 2 seconds)
 * 
 * ⚡ 3x FASTER! ⚡
 * 
 * KEY CONCEPTS:
 * =============
 * 
 * 1. WORKER DISTRIBUTION:
 *    - Tests are automatically assigned to available workers
 *    - Each worker runs tests independently
 *    - Worker 0 gets: tests 1, 4, 7
 *    - Worker 1 gets: tests 2, 5, 8
 *    - Worker 2 gets: tests 3, 6, 9
 * 
 * 2. WORKER INDEX:
 *    - testInfo.parallelIndex gives you the worker number (0, 1, 2, ...)
 *    - Use this for logging and debugging
 *    - Important for data partitioning (next examples)
 * 
 * 3. PARALLEL MODE:
 *    - test.describe.configure({ mode: 'parallel' })
 *    - Without this, tests run sequentially even with multiple workers
 *    - Must be set at describe block level
 * 
 * TRY THIS:
 * =========
 * 
 * 1. Run with --workers=1 and note the time
 * 2. Run with --workers=3 and note the time
 * 3. Calculate speedup: time(1 worker) ÷ time(3 workers)
 * 4. Try different worker counts: --workers=2, --workers=4
 * 5. Remove test.describe.configure({ mode: 'parallel' }) and see what happens!
 * 
 * NEXT STEP:
 * ==========
 * Move to Example 02 to learn about race conditions and what can go wrong!
 */
