/**
 * Custom console reporter showing worker information
 */
class WorkerReporter {
  onBegin(config, suite) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Starting test run with ${config.workers} worker(s)`);
    console.log(`Project: ${config.projects.map(p => p.name).join(', ')}`);
    console.log(`${'='.repeat(80)}\n`);
  }

  onTestBegin(test) {
    const workerId = test.parallelIndex;
    const workerIndex = process.env.TEST_WORKER_INDEX || '?';
    console.log(`\n[Worker ${workerIndex}][Test ${workerId + 1}] 🚀 STARTING: ${test.title}`);
  }

  onStdOut(chunk, test) {
    // Pass through stdout with worker context preserved
    process.stdout.write(chunk);
  }

  onStdErr(chunk, test) {
    // Pass through stderr with worker context preserved
    process.stderr.write(chunk);
  }

  onTestEnd(test, result) {
    const workerId = test.parallelIndex;
    const workerIndex = process.env.TEST_WORKER_INDEX || '?';
    const duration = (result.duration / 1000).toFixed(2);
    
    const statusIcon = {
      passed: '✅',
      failed: '❌',
      skipped: '⏭️',
      timedOut: '⏱️'
    }[result.status] || '❓';

    const statusColor = {
      passed: '\x1b[32m',  // Green
      failed: '\x1b[31m',  // Red
      skipped: '\x1b[33m', // Yellow
      timedOut: '\x1b[35m' // Magenta
    }[result.status] || '\x1b[37m'; // White

    const reset = '\x1b[0m';

    console.log(`[Worker ${workerIndex}][Test ${workerId + 1}] ${statusIcon} ${statusColor}${result.status.toUpperCase()}${reset}: ${test.title} (${duration}s)`);
    
    if (result.status === 'failed' && result.error) {
      console.log(`[Worker ${workerIndex}] 💥 Error: ${result.error.message}`);
    }
  }

  onEnd(result) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Test run finished!`);
    console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
    console.log(`Status: ${result.status.toUpperCase()}`);
    console.log(`${'='.repeat(80)}\n`);
  }
}

module.exports = WorkerReporter;
