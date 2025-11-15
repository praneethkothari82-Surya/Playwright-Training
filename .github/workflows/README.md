# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated testing.

## Workflows

### 1. **playwright.yml** - Main CI/CD Pipeline
**Triggers:**
- Push to `main` or `master` branch
- Pull requests to `main` or `master` branch
- Manual trigger via workflow_dispatch

**Features:**
- Runs tests in parallel using 4 shards
- Tests run on Ubuntu latest
- Supports Chromium, Firefox, and WebKit browsers
- Uses blob reporter for efficient report merging
- Generates consolidated HTML report
- Retries failed tests 2 times on CI

**Jobs:**
1. **test** - Runs Playwright tests across 4 shards
   - Each shard runs independently in parallel
   - Uploads blob reports as artifacts
2. **merge-reports** - Merges all shard reports into single HTML report
   - Downloads all blob reports
   - Generates unified HTML report
   - Uploads final report (14-day retention)

---

### 2. **scheduled-tests.yml** - Scheduled Regression Testing
**Triggers:**
- Runs daily at 2 AM UTC
- Manual trigger via workflow_dispatch

**Features:**
- Same parallel execution as main workflow
- Extended report retention (30 days)
- Ideal for nightly regression testing

**Use Cases:**
- Daily health checks
- Regression testing
- Monitoring application stability

---

### 3. **training-tests.yml** - Training Module Tests
**Triggers:**
- Changes to `Training/` folder
- Changes to `pages/` folder
- Changes to `playwright.config.ts`
- Manual trigger via workflow_dispatch

**Features:**
- Runs only Training module tests
- Uses 2 workers for faster feedback
- Chromium-only (faster installation)
- 7-day artifact retention

**Use Cases:**
- Validating training examples
- Testing parallel execution patterns
- Quick feedback on page object changes

---

## Sharding Strategy

All workflows use **4 shards** to distribute tests across multiple runners:

```
Total Parallelism = shards × workers
                  = 4 shards × 3 workers = 12 parallel tests
```

**Benefits:**
- Faster test execution (4x speedup)
- Better resource utilization
- Reduced CI time and costs

---

## Reports

### Blob Reporter
- Used in CI for sharded runs
- Generates binary blob files
- Merged after all shards complete
- Enables efficient parallel execution

### HTML Report
- Generated after merging blob reports
- Available as GitHub Actions artifact
- Accessible from workflow run summary
- Contains detailed test results, screenshots, traces

---

## Accessing Reports

1. Go to **Actions** tab in GitHub
2. Click on a workflow run
3. Scroll to **Artifacts** section
4. Download `html-report--attempt-<number>.zip`
5. Extract and open `index.html`

---

## Manual Workflow Triggers

All workflows support manual triggering:

1. Go to **Actions** tab
2. Select workflow from left sidebar
3. Click **Run workflow** button
4. Choose branch and click **Run workflow**

---

## Environment Variables

The workflows automatically set `CI=true`, which affects:
- **Retries**: 2 retries on CI (vs 0 locally)
- **Workers**: 3 workers on CI (vs unlimited locally)
- **Reporter**: Blob reporter on CI (vs HTML locally)
- **forbidOnly**: Fails if `test.only` is found

---

## Customization

### Adjust Number of Shards

Edit the matrix in workflow files:

```yaml
strategy:
  matrix:
    shardIndex: [1, 2, 3, 4, 5, 6]  # Add more shards
    shardTotal: [6]                  # Update total
```

### Change Schedule

Edit cron expression in `scheduled-tests.yml`:

```yaml
schedule:
  - cron: '0 2 * * *'  # Daily at 2 AM UTC
  - cron: '0 */6 * * *'  # Every 6 hours
  - cron: '0 0 * * 1'  # Every Monday
```

### Run Specific Tests

Add filter to test command:

```yaml
- name: Run Playwright tests
  run: npx playwright test tests/login.spec.js --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
```

---

## Troubleshooting

### Workflow Fails to Find Tests
- Check `testMatch` pattern in `playwright.config.ts`
- Ensure test files are committed
- Verify paths in workflow triggers

### Reports Not Generated
- Check if all shards completed
- Verify blob reporter is configured
- Check artifact upload/download steps

### Tests Timeout
- Increase `timeout-minutes` in workflow
- Reduce number of workers
- Optimize test execution time

---

## Best Practices

1. **Keep shards balanced** - Similar number of tests per shard
2. **Monitor CI time** - Adjust shards/workers based on metrics
3. **Review failed runs** - Download reports and traces
4. **Use workflow_dispatch** - For manual testing and debugging
5. **Update Node version** - Keep Node.js up to date (currently v18)

---

## Next Steps

- [ ] Set up Playwright GitHub App for inline PR comments
- [ ] Add deployment workflows after tests pass
- [ ] Implement test result notifications (Slack, Teams, etc.)
- [ ] Add performance benchmarking workflow
- [ ] Set up test flakiness detection
