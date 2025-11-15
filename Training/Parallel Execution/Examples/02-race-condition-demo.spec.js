const { test } = require('@playwright/test');
const { readCSV } = require('../../../utils/csvReader');

/**
 * EXAMPLE 2: RACE CONDITION DEMONSTRATION
 * ========================================
 * 
 * ⚠️ WARNING: THIS TEST WILL FAIL! ⚠️
 * 
 * This example demonstrates what happens when you DON'T handle
 * data properly in parallel tests. You'll see race conditions in action!
 * 
 * WHAT IS A RACE CONDITION?
 * - Multiple workers trying to use the same data simultaneously
 * - Causes conflicts, errors, and unpredictable behavior
 * - Common in registration, database operations, file writes
 * 
 * THIS EXAMPLE SHOWS:
 * - How duplicate data usage fails
 * - Why worker isolation is important
 * - What error messages look like
 * 
 * RUN THIS TO SEE THE PROBLEM:
 * npx playwright test "Training/Parallel Execution/Examples/02-race-condition-demo.spec.js" --workers=3
 */

let allUsers = [];

// Load data once before all tests
test.beforeAll(async () => {
    allUsers = await readCSV('testdata/users.csv');
    console.log(`\n📊 Loaded ${allUsers.length} users\n`);
    console.log('⚠️ WARNING: This test will demonstrate race conditions!');
    console.log('⚠️ Expected: Some tests will FAIL due to duplicate data usage\n');
});

// Enable parallel mode
test.describe.configure({ mode: 'parallel' });

test.describe('Race Condition Demo - PROBLEMATIC CODE', () => {
    
    // ❌ PROBLEM: All workers use the same indices!
    for (let i = 0; i < 5; i++) {
        test(`Registration Test ${i + 1} - WILL HAVE CONFLICTS`, async ({ page }, testInfo) => {
            const workerIndex = testInfo.parallelIndex;
            const workerPrefix = `[W${workerIndex}]`;
            
            // ❌ PROBLEM: All workers get allUsers[i]
            // If 3 workers run test 1 simultaneously:
            // - Worker 0: uses allUsers[0]
            // - Worker 1: uses allUsers[0]  ← DUPLICATE!
            // - Worker 2: uses allUsers[0]  ← DUPLICATE!
            const user = allUsers[i];
            
            console.log(`${workerPrefix} 📧 Attempting to use: ${user.email} (index: ${i})`);
            console.log(`${workerPrefix} ⚠️ This email might be used by another worker!`);
            
            // Simulate registration
            await page.goto('https://example.com');
            
            // In a real app, this would fail with "email already exists" error
            console.log(`${workerPrefix} ⚠️ If this were real registration, conflicts would occur!`);
            
            // Simulate checking for duplicates
            const isDuplicate = checkIfEmailUsedByOtherWorkers(user.email, workerIndex);
            if (isDuplicate) {
                console.log(`${workerPrefix} ❌ RACE CONDITION DETECTED!`);
                console.log(`${workerPrefix} ❌ Email ${user.email} is being used by another worker!`);
            }
            
            await page.waitForTimeout(1000);
        });
    }
});

// Track which worker is using which email (for demo purposes)
const emailUsage = new Map();

function checkIfEmailUsedByOtherWorkers(email, currentWorker) {
    if (emailUsage.has(email)) {
        const previousWorker = emailUsage.get(email);
        console.log(`\n🔴 RACE CONDITION!`);
        console.log(`   Email: ${email}`);
        console.log(`   Used by Worker ${previousWorker} and Worker ${currentWorker} simultaneously!`);
        console.log(`   This causes duplicate registration errors!\n`);
        return true;
    }
    emailUsage.set(email, currentWorker);
    return false;
}

/**
 * WHAT YOU'LL SEE WHEN YOU RUN THIS:
 * ===================================
 * 
 * [W0] 📧 Attempting to use: john.doe9er@test.com (index: 0)
 * [W1] 📧 Attempting to use: john.doe9er@test.com (index: 0)  ← SAME EMAIL!
 * [W2] 📧 Attempting to use: john.doe9er@test.com (index: 0)  ← SAME EMAIL!
 * 
 * 🔴 RACE CONDITION!
 *    Email: john.doe9er@test.com
 *    Used by Worker 0 and Worker 1 simultaneously!
 *    This causes duplicate registration errors!
 * 
 * WHY THIS HAPPENS:
 * =================
 * 
 * Test Iteration 0:
 * - Worker 0 runs "Registration Test 1" → uses allUsers[0]
 * - Worker 1 runs "Registration Test 1" → uses allUsers[0]  ← DUPLICATE!
 * - Worker 2 runs "Registration Test 1" → uses allUsers[0]  ← DUPLICATE!
 * 
 * Test Iteration 1:
 * - Worker 0 runs "Registration Test 2" → uses allUsers[1]
 * - Worker 1 runs "Registration Test 2" → uses allUsers[1]  ← DUPLICATE!
 * - Worker 2 runs "Registration Test 2" → uses allUsers[1]  ← DUPLICATE!
 * 
 * THE PROBLEM:
 * - Loop index 'i' is the SAME for all workers
 * - All workers access allUsers[0], then allUsers[1], etc.
 * - No consideration for which worker is running
 * 
 * IN REAL APPLICATIONS:
 * ====================
 * 
 * This would cause errors like:
 * ❌ "Email already registered"
 * ❌ "Duplicate entry for key 'email'"
 * ❌ "User already exists"
 * ❌ Test failures and flaky tests
 * 
 * THE SOLUTION:
 * =============
 * 
 * Each worker needs UNIQUE data!
 * 
 * See Example 03 (worker-isolation.spec.js) for the FIX!
 * 
 * FORMULA:
 * --------
 * ❌ WRONG: const user = allUsers[i]
 * ✅ RIGHT: const user = allUsers[(workerIndex * dataPerWorker) + i]
 * 
 * This ensures:
 * - Worker 0 uses indices: 0-9
 * - Worker 1 uses indices: 10-19
 * - Worker 2 uses indices: 20-29
 * - NO OVERLAP!
 * 
 * KEY TAKEAWAYS:
 * ==============
 * 
 * 1. ❌ Loop index alone is NOT enough for parallel tests
 * 2. ❌ All workers see the same shared data array
 * 3. ❌ Without worker-specific indexing, you get conflicts
 * 4. ✅ Must partition data based on worker index
 * 5. ✅ Use TestDataManager or manual partitioning
 * 
 * EXERCISE:
 * =========
 * 
 * 1. Run this test and observe the race conditions
 * 2. Count how many conflicts occur
 * 3. Try with different worker counts (--workers=2, --workers=4)
 * 4. Think about how you would fix this
 * 5. Then move to Example 03 to see the solution!
 * 
 * REMEMBER:
 * =========
 * This is a DEMO of what NOT to do!
 * Never write production code like this!
 * Always use worker isolation (next example).
 */
