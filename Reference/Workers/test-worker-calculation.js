/**
 * Test Worker Calculation Tool
 * 
 * @description
 * Diagnostic tool that calculates optimal Playwright worker allocation based on system resources.
 * Demonstrates the same calculation logic used in Jenkins CI/CD pipelines.
 * 
 * @usage
 *   node test-worker-calculation.js
 * 
 * @purpose
 * - Understand local machine capabilities before pushing to Jenkins
 * - Estimate test execution time improvements with parallel workers
 * - Verify system has adequate CPU/RAM for parallel testing
 * - Help team members understand worker allocation
 * 
 * @formula
 *   Workers = Math.floor(CPU Cores × 0.75)
 * 
 * @output
 * - System resource information (CPU, Memory)
 * - Calculated worker count
 * - Performance comparison table
 * - Recommendations based on resources
 * - Command examples for running tests
 * 
 * @see WORKER_CALCULATION_TOOL.md - Complete documentation
 * @see JENKINS_WORKERS.md - Jenkins worker configuration guide
 * @see playwright.config.ts - Playwright configuration
 * 
 * @author DevOps Team
 * @version 1.0
 * @date November 14, 2025
 */

const os = require('os');

// Get CPU information
const cpuCores = os.cpus().length;
const cpuModel = os.cpus()[0].model;
const totalMemoryGB = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
const freeMemoryGB = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);

// Calculate workers (75% of CPU cores)
const workerCount = Math.floor(cpuCores * 0.75);

// Display system information
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║         System Resource & Worker Calculation              ║');
console.log('╠════════════════════════════════════════════════════════════╣');
console.log(`║ CPU Model:           ${cpuModel.substring(0, 35).padEnd(35)} ║`);
console.log(`║ CPU Cores Available: ${cpuCores.toString().padEnd(35)} ║`);
console.log(`║ Total Memory:        ${totalMemoryGB + ' GB'.padEnd(35)} ║`);
console.log(`║ Free Memory:         ${freeMemoryGB + ' GB'.padEnd(35)} ║`);
console.log('╠════════════════════════════════════════════════════════════╣');
console.log(`║ Formula:             cores × 0.75 = workers               ║`);
console.log(`║ Calculation:         ${cpuCores} × 0.75 = ${(cpuCores * 0.75).toFixed(1).padEnd(26)} ║`);
console.log(`║ Workers Assigned:    ${workerCount.toString().padEnd(35)} ║`);
console.log('╠════════════════════════════════════════════════════════════╣');
console.log(`║ This machine can run ${workerCount} parallel Playwright workers      ║`);
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Calculate expected test time reduction
console.log('Performance Comparison (100 tests example):');
console.log('┌────────────┬──────────────┬──────────────┬─────────────────┐');
console.log('│  Workers   │  Duration    │  CPU Usage   │  Efficiency     │');
console.log('├────────────┼──────────────┼──────────────┼─────────────────┤');
console.log('│     1      │   20 min     │     25%      │      ⭐         │');
console.log(`│     ${workerCount}      │   ${Math.ceil(20 / workerCount)} min      │     ${Math.min(75, workerCount * 25)}%      │      ${'⭐'.repeat(Math.min(5, workerCount))}         │`);
console.log('└────────────┴──────────────┴──────────────┴─────────────────┘\n');

// Recommendations
console.log('Recommendations:');
if (workerCount >= 6) {
    console.log('✅ Excellent! Your system can handle heavy parallel testing.');
} else if (workerCount >= 3) {
    console.log('✅ Good! Your system is well-suited for parallel testing.');
} else if (workerCount >= 2) {
    console.log('⚠️  Fair. Consider upgrading for better performance.');
} else {
    console.log('⚠️  Limited. Tests will run mostly sequentially.');
}

console.log(`\nTo run Playwright with these workers:`);
console.log(`  npx playwright test --workers=${workerCount}`);
console.log(`\nOr use environment variable:`);
console.log(`  set PLAYWRIGHT_WORKERS=${workerCount} (Windows)`);
console.log(`  export PLAYWRIGHT_WORKERS=${workerCount} (Linux/Mac)\n`);
