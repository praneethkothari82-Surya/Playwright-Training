const fs = require('fs');
const path = require('path');

class SimpleHTMLReporter {
  constructor(options = {}) {
    this.outputFile = options.outputFile || 'test-results/simple-report.html';
  }

  onBegin(config, suite) {
    this.suite = suite;
    this.startTime = Date.now();
    this.results = [];
  }

  onTestEnd(test, result) {
    this.results.push({
      title: test.title,
      status: result.status,
      duration: result.duration,
      error: result.error ? result.error.message : null,
      location: `${test.location.file}:${test.location.line}`,
      annotations: test.annotations,
    });
  }

  async onEnd(result) {
    const duration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;

    const html = this.generateHTML({
      total: this.results.length,
      passed,
      failed,
      skipped,
      duration,
      results: this.results,
      timestamp: new Date().toISOString(),
    });

    const dir = path.dirname(this.outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.outputFile, html);
    console.log(`Simple HTML report saved to: ${this.outputFile}`);
  }

  generateHTML(data) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playwright Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
        }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { opacity: 0.9; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f9fafb;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #ddd;
        }
        .stat-card.passed { border-left-color: #10b981; }
        .stat-card.failed { border-left-color: #ef4444; }
        .stat-card.skipped { border-left-color: #f59e0b; }
        .stat-card .label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .stat-card .value {
            font-size: 32px;
            font-weight: bold;
            margin-top: 5px;
        }
        .stat-card.passed .value { color: #10b981; }
        .stat-card.failed .value { color: #ef4444; }
        .stat-card.skipped .value { color: #f59e0b; }
        .tests {
            padding: 30px;
        }
        .test-item {
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            margin-bottom: 15px;
            overflow: hidden;
        }
        .test-header {
            padding: 15px 20px;
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: background 0.2s;
        }
        .test-header:hover { background: #f9fafb; }
        .test-status {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            margin-right: 15px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
        }
        .test-status.passed {
            background: #10b981;
            color: white;
        }
        .test-status.failed {
            background: #ef4444;
            color: white;
        }
        .test-status.skipped {
            background: #f59e0b;
            color: white;
        }
        .test-title {
            flex: 1;
            font-weight: 500;
        }
        .test-duration {
            color: #6b7280;
            font-size: 14px;
        }
        .test-details {
            padding: 15px 20px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            display: none;
        }
        .test-item.expanded .test-details { display: block; }
        .test-location {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 10px;
            font-family: monospace;
        }
        .error-message {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 4px;
            padding: 12px;
            color: #991b1b;
            font-family: monospace;
            font-size: 13px;
            white-space: pre-wrap;
            margin-top: 10px;
        }
        .tags {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 10px;
        }
        .tag {
            background: #e0e7ff;
            color: #3730a3;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Playwright Test Report</h1>
            <p>Generated: ${new Date(data.timestamp).toLocaleString()}</p>
            <p>Duration: ${(data.duration / 1000).toFixed(2)}s</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="label">Total Tests</div>
                <div class="value">${data.total}</div>
            </div>
            <div class="stat-card passed">
                <div class="label">Passed</div>
                <div class="value">${data.passed}</div>
            </div>
            <div class="stat-card failed">
                <div class="label">Failed</div>
                <div class="value">${data.failed}</div>
            </div>
            <div class="stat-card skipped">
                <div class="label">Skipped</div>
                <div class="value">${data.skipped}</div>
            </div>
        </div>
        
        <div class="tests">
            <h2 style="margin-bottom: 20px; color: #1f2937;">Test Results</h2>
            ${data.results.map((test, index) => `
                <div class="test-item" onclick="this.classList.toggle('expanded')">
                    <div class="test-header">
                        <div class="test-status ${test.status}">
                            ${test.status === 'passed' ? '✓' : test.status === 'failed' ? '✗' : '○'}
                        </div>
                        <div class="test-title">${this.escapeHtml(test.title)}</div>
                        <div class="test-duration">${(test.duration / 1000).toFixed(2)}s</div>
                    </div>
                    <div class="test-details">
                        <div class="test-location">📍 ${this.escapeHtml(test.location)}</div>
                        ${test.annotations.length > 0 ? `
                            <div class="tags">
                                ${test.annotations.map(a => `<span class="tag">${this.escapeHtml(a.type)}</span>`).join('')}
                            </div>
                        ` : ''}
                        ${test.error ? `
                            <div class="error-message">${this.escapeHtml(test.error)}</div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

module.exports = SimpleHTMLReporter;
